Feature: OKR — Objectives and Key Results
  As a project manager or team lead
  I want to turn a vague goal into a structured OKR
  So I have a measurable commitment with clear success criteria

  Background:
    Given the RIA Toolkit is open
    And the OKR tool is selected

  Scenario: Tool is visible in the Delivery category
    Then the nav button "OKR" appears under the "Delivery" category

  Scenario: User enters a goal and gets a structured OKR
    When I enter "Improve our deployment pipeline reliability"
    And I enter context "Currently failing 15% of deploys, team of 5, 3-month cycle"
    Then the output contains one Objective
    And the output contains 3 to 5 Key Results
    And each Key Result has a measurable target
    And each Key Result has a confidence score between 0 and 1

  Scenario: Objective is qualitative and inspiring
    When the OKR is generated
    Then the Objective does not contain a number or percentage
    And it describes direction rather than measurement

  Scenario: Key Results are quantitative and time-bound
    When Key Results are returned
    Then each Key Result specifies what to measure, the baseline, and the target
    And stretch Key Results are flagged

  Scenario: Watch-outs are surfaced
    When the OKR is generated
    Then a list of watch-outs or anti-patterns is returned
    And a recommended cadence for check-ins is provided

  Scenario: Warning shown if no goal entered
    When I click "Build OKR" without entering a goal
    Then a warning message is shown
    And no API call is made

  Scenario: Output is cleared on clear button click
    Given OKR results are shown
    When I click "Clear"
    Then the output and all input fields are reset
