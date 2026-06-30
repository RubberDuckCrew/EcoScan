from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent

from ecoscan_ai.alternatives.models import AlternativesRequest, AlternativesResult
from ecoscan_ai.llm import llm
from ecoscan_ai.api.schemas.alternatives import AlternativesOutput
from ecoscan_ai.tools.database_search import search_products_by_category

from ecoscan_ai.tools import duckduckgo_search


@CrewBase
class AlternativesCrew:
    agents: list[BaseAgent]
    tasks: list[Task]

    @agent
    def alternatives_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['alternatives_researcher'],
            llm=llm,
            tools=[search_products_by_category],
            verbose=True
        )

    @agent
    def coordinates_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['coordinates_researcher'],
            llm=llm,
            tools=[duckduckgo_search],
            verbose=True
        )

    @task
    def research_alternatives_task(self) -> Task:
        return Task(
            config=self.tasks_config['research_alternatives_task'],
        )

    @task
    def find_coordinates_task(self) -> Task:
        return Task(
            config=self.tasks_config['find_coordinates_task'],
            output_json=AlternativesOutput
        )

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )

    def run(self, request: AlternativesRequest) -> AlternativesResult:
        result = self.crew().kickoff(inputs={"categories": request.productContext})
        pydantic_output: GreenScoreResult = result.pydantic  # type: ignore[assignment]
        return pydantic_output
