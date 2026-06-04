from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task
from crewai.agents.agent_builder.base_agent import BaseAgent

from ecoscan_ai.llm import llm
from ecoscan_ai.tools import duckduckgo_search
from ecoscan_ai.api.schemas.alternatives import AlternativesOutput


# If you want to run a snippet of code before or after the crew starts,
# you can use the @before_kickoff and @after_kickoff decorators
# https://docs.crewai.com/concepts/crews#example-crew-class-with-decorators

@CrewBase
class AlternativesCrew:
    agents: list[BaseAgent]
    tasks: list[Task]

    @agent
    def alternatives_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['alternatives_researcher'],  # type: ignore[index]
            llm=llm,
            tools=[duckduckgo_search], #TODO: Datenbank als Tool
            verbose=True
        )

    @agent
    def coordinates_researcher(self) -> Agent:
        return Agent(
            config=self.agents_config['coordinates_researcher'],  # type: ignore[index]
            llm=llm,
            tools=[duckduckgo_search],
            verbose=True
        )

    @task
    def research_alternatives_task(self) -> Task:
        return Task(
            config=self.tasks_config['research_alternatives_task'],  # type: ignore[index]
        )

    @task
    def find_coordinates_task(self) -> Task:
        return Task(
            config=self.tasks_config['find_coordinates_task'],  # type: ignore[index]
            output_json=AlternativesOutput
        )

    @crew
    def crew(self) -> Crew:
        """Creates the EcoscanAi crew"""
        # To learn how to add knowledge sources to your crew, check out the documentation:
        # https://docs.crewai.com/concepts/knowledge#what-is-knowledge

        return Crew(
            agents=self.agents,  # Automatically created by the @agent decorator
            tasks=self.tasks,  # Automatically created by the @task decorator
            process=Process.sequential,
            verbose=True,
            # process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
        )
