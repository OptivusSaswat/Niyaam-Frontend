import os
import uuid
from dataclasses import dataclass

from google.adk.agents import Agent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.adk.tools import google_search
from google.genai import types

from src.agents.prompts import (
    ROUTER_SYSTEM_PROMPT,
    WEB_SEARCH_AGENT_PROMPT,
    LAW_RESPONSE_AGENT_PROMPT,
)
from src.core.config import GEMINI_API_KEY

GEMINI_MODEL = "gemini-2.5-flash"
APP_NAME = "niyam"


@dataclass
class AgentResponse:
    content: str
    agent_used: str | None = None


def _build_agent_tree() -> Agent:
    """Build the router → sub-agent hierarchy."""

    web_search_agent = Agent(
        name="web_search_agent",
        model=GEMINI_MODEL,
        description="Searches the web for current legal information, recent judgments, latest amendments, and legal news from India and globally.",
        instruction=WEB_SEARCH_AGENT_PROMPT,
        tools=[google_search],
    )

    law_response_agent = Agent(
        name="law_response_agent",
        model=GEMINI_MODEL,
        description="Provides detailed legal analysis, explains laws, interprets statutes, and gives legal guidance based on Indian legal frameworks including BNS, BNSS, Constitution, and all major acts.",
        instruction=LAW_RESPONSE_AGENT_PROMPT,
    )

    router_agent = Agent(
        name="router_agent",
        model=GEMINI_MODEL,
        description="Main Niyam AI router that delegates queries to specialist agents.",
        instruction=ROUTER_SYSTEM_PROMPT,
        sub_agents=[web_search_agent, law_response_agent],
    )

    return router_agent


class AgentOrchestrator:
    """Orchestrates the router agent and its sub-agents using Google ADK.

    Architecture:
        User Query → RouterAgent → auto-delegates to:
            - WebSearchAgent (real-time info via google_search tool)
            - LawResponseAgent (legal analysis via Gemini's knowledge)
    """

    def __init__(self):
        self._validate_config()
        os.environ["GOOGLE_API_KEY"] = GEMINI_API_KEY
        os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "FALSE"

        self._agent = _build_agent_tree()
        self._session_service = InMemorySessionService()
        self._runner = Runner(
            agent=self._agent,
            app_name=APP_NAME,
            session_service=self._session_service,
        )

    def _validate_config(self):
        if not GEMINI_API_KEY:
            raise ValueError(
                "GEMINI_API_KEY is required. Set it in your .env file."
            )

    async def process_query(self, user_query: str, session_id: str | None = None) -> AgentResponse:
        """Process a user query through the router agent pipeline."""
        user_id = "default"
        sid = session_id or str(uuid.uuid4())

        session = await self._session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=sid,
        )

        message = types.Content(
            role="user",
            parts=[types.Part(text=user_query)],
        )

        final_text = ""
        async for event in self._runner.run_async(
            user_id=user_id,
            session_id=session.id,
            new_message=message,
        ):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        final_text += part.text

        return AgentResponse(
            content=final_text or "I couldn't process your query. Please try again.",
        )

    async def process_query_stream(self, user_query: str, session_id: str | None = None):
        """Process a user query and yield text chunks as they arrive (for SSE streaming)."""
        user_id = "default"
        sid = session_id or str(uuid.uuid4())

        session = await self._session_service.create_session(
            app_name=APP_NAME,
            user_id=user_id,
            session_id=sid,
        )

        message = types.Content(
            role="user",
            parts=[types.Part(text=user_query)],
        )

        async for event in self._runner.run_async(
            user_id=user_id,
            session_id=session.id,
            new_message=message,
        ):
            if event.content and event.content.parts:
                for part in event.content.parts:
                    if part.text:
                        yield part.text
