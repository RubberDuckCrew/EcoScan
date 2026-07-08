from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

from ecoscan_ai.alternatives.models import AlternativesResult, AlternativesStoreResult
from ecoscan_ai.tools.find_nearby_stores_tool import FindNearbyStoresTool
from ecoscan_ai.tools.search_by_category_tool import SearchProductsByCategoryTool


@CrewBase
class AlternativesCrew:
    @agent
    def alternatives_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config["alternatives_researcher"],
            tools=[SearchProductsByCategoryTool()],
            verbose=True,
            max_iter=10,
        )

    @agent
    def coordinates_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config["coordinates_researcher"],
            tools=[FindNearbyStoresTool()],
            verbose=True,
        )

    @task
    def research_alternatives_task(self) -> Task:
        return Task(
            config=self.tasks_config["research_alternatives_task"],
            agent=self.alternatives_researcher(),
            output_pydantic=AlternativesResult,
        )

    @task
    def find_coordinates_task(self) -> Task:
        return Task(
            config=self.tasks_config["find_coordinates_task"],
            agent=self.coordinates_researcher(),
            output_pydantic=AlternativesStoreResult,
        )

    @crew
    def product_crew(self) -> Crew:
        return Crew(
            agents=[self.alternatives_researcher()],
            tasks=[self.research_alternatives_task()],
            process=Process.sequential,
            verbose=True,
        )

    @crew
    def location_crew(self) -> Crew:
        return Crew(
            agents=[self.coordinates_researcher()],
            tasks=[self.find_coordinates_task()],
            process=Process.sequential,
            verbose=True,
        )

    # def run(self, request: AlternativesRequest) -> AlternativesResult:
    #     result = self.crew().kickoff(
    #         inputs={
    #             "categories": request.categories,
    #             "user_coordinates": request.userCoordinates,
    #         }
    #     )
    #     pydantic_output: AlternativesResult = result.pydantic  # type: ignore[assignment]
    #     pydantic_output.storeJobId = request.storeJobId
    #     return pydantic_output
