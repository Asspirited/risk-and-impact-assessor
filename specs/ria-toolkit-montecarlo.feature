Feature: Monte Carlo — schedule and cost simulation
  As a project manager or risk analyst
  I want to enter 3-point estimates for project variables
  So I can understand the probability distribution of my schedule or cost outcome

  Background:
    Given the RIA Toolkit is open
    And the Monte Carlo tool is selected

  Scenario: Tool is visible in the Risk category
    Then the nav button "Monte Carlo" appears under the "Risk" category

  Scenario: User enters a project and variable estimates
    When I enter "Mobile app relaunch" as the project
    And I enter unit "weeks"
    And I enter variables:
      | name             | optimistic | most_likely | pessimistic |
      | Design           | 2          | 3           | 6           |
      | Backend build    | 4          | 6           | 12          |
      | QA and testing   | 1          | 2           | 5           |
    Then the output contains P50, P80, and P90 estimates in weeks
    And the key risk drivers are identified
    And a recommendation is returned

  Scenario: PERT means and standard deviations are calculated correctly
    Given a variable with optimistic=2, most_likely=4, pessimistic=10
    Then the PERT mean is approximately 4.33
    And the standard deviation is approximately 1.33

  Scenario: P80 and P90 exceed P50
    When the simulation runs with multiple variables
    Then P80 is greater than P50
    And P90 is greater than P80

  Scenario: Variables with the widest spread are flagged as key drivers
    When one variable has a pessimistic 5× its optimistic
    And another has a pessimistic 1.5× its optimistic
    Then the first variable is identified as a key driver

  Scenario: Warning shown if no project entered
    When I click "Run Simulation" without entering a project
    Then a warning message is shown
    And no API call is made

  Scenario: Output is cleared on clear button click
    Given simulation results are shown
    When I click "Clear"
    Then the output and all input fields are reset
