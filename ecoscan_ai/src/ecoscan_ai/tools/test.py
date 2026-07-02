# TODO: Remove after integrating into real crew

# noinspection PyPackageRequirements
from crewai import Agent, Task, Crew

from ecoscan_ai.tools.test_tool import TestTool

test_tool = TestTool()

agent = Agent(
    role="Data Analyst",
    goal="Query backend data and summarize it clearly",
    backstory="You have access to an internal backend tool to retrieve data.",
    tools=[test_tool],
    verbose=True,
)

task = Task(
    description="Call the test endpoint and report whether access was successful.",
    expected_output="A short confirmation of whether access worked, including the client ID from the response.",
    agent=agent,
)


def test() -> None:
    crew = Crew(agents=[agent], tasks=[task], verbose=True)
    result = crew.kickoff()
    print(result)
