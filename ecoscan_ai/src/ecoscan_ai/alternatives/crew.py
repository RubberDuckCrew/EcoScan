from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

from ecoscan_ai.alternatives.models import AlternativesRequest, AlternativesResult
from ecoscan_ai.tools.dddg_search_tool import DuckDuckGoSearchTool
from ecoscan_ai.tools.search_by_category_tool import SearchProductsByCategoryTool


@CrewBase
class AlternativesCrew:

    @agent
    def alternatives_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['alternatives_researcher'],
            # llm=llm,
            tools=[SearchProductsByCategoryTool()],
            verbose=True
        )

    @agent
    def coordinates_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['coordinates_researcher'],
            # llm=llm,
            tools=[DuckDuckGoSearchTool()],
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
            output_pydantic=AlternativesResult
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
        result = self.crew().kickoff(inputs={"categories": request.categories, "user_coordinates": request.userCoordinates})
        pydantic_output: AlternativesResult = result.pydantic  # type: ignore[assignment]
        return pydantic_output
