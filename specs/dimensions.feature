Feature: Dimension scoring
  The dimensions module validates 28 sub-criteria inputs and computes
  a score per dimension as the average of its four sub-criteria.

  Background:
    Given the seven dimensions are: SCOPE, COST, TIME, QUALITY, COMPLEXITY, UNCERTAINTY, RAID
    And each dimension contains exactly four sub-criteria scored 0–5

  Scenario: Valid input passes validation
    Given all 28 sub-criteria are set to 0
    Then validation passes without error

  Scenario: All sub-criteria at maximum passes validation
    Given all 28 sub-criteria are set to 5
    Then validation passes without error

  Scenario: Missing sub-criterion throws
    Given all 28 sub-criteria are set to 0
    And "technicalDebt" is removed
    Then validation throws containing "technicalDebt"

  Scenario: Sub-criterion above 5 throws
    Given all 28 sub-criteria are set to 0
    And "riskVisibility" is set to 6
    Then validation throws containing "riskVisibility"

  Scenario: Sub-criterion below 0 throws
    Given all 28 sub-criteria are set to 0
    And "changeFrequency" is set to -1
    Then validation throws containing "changeFrequency"

  Scenario: Non-numeric sub-criterion throws
    Given all 28 sub-criteria are set to 0
    And "budgetCertainty" is set to "high"
    Then validation throws containing "budgetCertainty"

  Scenario: Dimension score is average of its four sub-criteria
    Given all sub-criteria are 0
    And "requirementsClarity" is set to 4
    And "stakeholderAlignment" is set to 2
    And "changeFrequency" is set to 0
    And "acceptanceCriteria" is set to 2
    Then the SCOPE dimension score is 2.0

  Scenario: Dimension score of all-zero sub-criteria is 0
    Given all sub-criteria are 0
    Then every dimension score is 0

  Scenario: Dimension score of all-five sub-criteria is 5
    Given all sub-criteria are 5
    Then every dimension score is 5

  Scenario Outline: Each dimension contains the correct sub-criteria
    Then dimension <dimension> contains sub-criteria <criteria>

    Examples:
      | dimension   | criteria                                                                                   |
      | SCOPE       | requirementsClarity, stakeholderAlignment, changeFrequency, acceptanceCriteria             |
      | COST        | budgetCertainty, contingencyAdequacy, costTracking, financialExposure                      |
      | TIME        | scheduleDefinition, milestoneConfidence, deadlineFlexibility, criticalPathVisibility        |
      | QUALITY     | qualityStandards, testingCoverage, technicalDebt, nonFunctionalRequirements                |
      | COMPLEXITY  | technicalComplexity, organisationalComplexity, integrationComplexity, regulatoryComplexity |
      | UNCERTAINTY | requirementsUncertainty, technicalUncertainty, stakeholderUncertainty, externalUncertainty |
      | RAID        | riskVisibility, issueResolution, assumptionValidity, dependencyConfidence                   |
