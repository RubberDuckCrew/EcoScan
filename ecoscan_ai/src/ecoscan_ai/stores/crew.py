from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

from ecoscan_ai.stores.models import AlternativesStoreResult
from ecoscan_ai.tools.find_nearby_stores_tool import FindNearbyStoresTool


@CrewBase
class StoresCrew:
    @agent
    def coordinates_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config["coordinates_researcher"],
            tools=[FindNearbyStoresTool()],
            verbose=True,
        )

    @task
    def find_coordinates_task(self) -> Task:
        return Task(
            config=self.tasks_config["find_coordinates_task"],
            agent=self.coordinates_researcher(),
            output_pydantic=AlternativesStoreResult,
        )

    @crew
    def location_crew(self) -> Crew:
        return Crew(
            agents=[self.coordinates_researcher()],
            tasks=[self.find_coordinates_task()],
            process=Process.sequential,
            verbose=True,
        )
