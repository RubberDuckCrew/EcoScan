from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task

from ecoscan_ai.alternatives.models import AlternativesResult
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

    @task
    def research_alternatives_task(self) -> Task:
        return Task(
            config=self.tasks_config["research_alternatives_task"],
            agent=self.alternatives_researcher(),
            output_pydantic=AlternativesResult,
        )

    @crew
    def product_crew(self) -> Crew:
        return Crew(
            agents=[self.alternatives_researcher()],
            tasks=[self.research_alternatives_task()],
            process=Process.sequential,
            verbose=True,
        )
