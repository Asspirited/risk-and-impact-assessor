Feature: Applied Information Economics
  As a decision-maker facing uncertainty
  I want to know whether gathering more data is worth the effort
  So I act on what matters and stop deliberating when the information has no value

  Background:
    Given the RIA Toolkit is open
    And the AIE tool is selected

  Scenario: Tool is visible in the Metrics category
    Then the nav button "Applied Information Economics" appears under the "Metrics" category

  Scenario: User enters a decision and gets uncertainty analysis
    When I enter "Whether to build our own data pipeline or buy an off-the-shelf solution"
    And I enter context "£200k budget cap, 18-month delivery, team has no data engineering experience"
    Then the output contains 2 to 4 uncertain variables
    And each variable has a 90% confidence interval
    And an EVPI assessment is returned

  Scenario: EVPI determines whether more data is worth gathering
    When the analysis runs
    Then evpi_assessment contains the key uncertainty
    And evpi_assessment.worth_measuring is a boolean
    And the recommendation advises act-now or gather-data based on EVPI vs measurement cost

  Scenario: Measurement options are practical and specific
    When worth_measuring is true
    Then measurement_options contains at least one option
    And each option specifies what to measure, how, and the expected uncertainty reduction

  Scenario: Confidence intervals are wide enough to be calibrated
    When uncertainties are returned
    Then each variable has distinct range_low and range_high values
    And the interval is expressed with units

  Scenario: Warning shown if no decision entered
    When I click "Analyse Decision" without entering a decision
    Then a warning message is shown
    And no API call is made

  Scenario: Output is cleared on clear button click
    Given AIE results are shown
    When I click "Clear"
    Then the output and all input fields are reset
