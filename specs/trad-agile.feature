Feature: Trad/Agile spectrum scoring
  The trad/agile module computes a 0–100 score from agile-indicator sub-criteria.
  Higher score = more suited to agile delivery.
  Bands: 0–30 Traditional, 31–70 Hybrid, 71–100 Agile.

  Scenario: All agile indicators at 0 scores 0 (Traditional)
    Given all sub-criteria are 0
    Then the tradAgile score is 0
    And the tradAgile label is "Traditional"

  Scenario: All agile indicators at 5 scores 100 (Agile)
    Given requirementsUncertainty=5, technicalUncertainty=5, changeFrequency=5,
      technicalComplexity=5, integrationComplexity=5, externalUncertainty=5,
      and all other sub-criteria at 0
    Then the tradAgile score is 100
    And the tradAgile label is "Agile"

  Scenario: Mixed agile indicators produce Hybrid
    Given requirementsUncertainty=3 and technicalUncertainty=2 and all others at 0
    Then the tradAgile score is between 31 and 70
    And the tradAgile label is "Hybrid"

  Scenario: Score is between 0 and 100 inclusive for any valid input
    Given any valid set of sub-criteria
    Then the tradAgile score is between 0 and 100

  Scenario: Score is deterministic
    Given the same sub-criteria input applied twice
    Then both tradAgile scores are equal

  Scenario Outline: Band boundaries are correct
    Given a tradAgile score of <score>
    Then the tradAgile label is <label>

    Examples:
      | score | label       |
      | 0     | Traditional |
      | 30    | Traditional |
      | 31    | Hybrid      |
      | 70    | Hybrid      |
      | 71    | Agile       |
      | 100   | Agile       |

  Scenario: Non-agile sub-criteria do not affect the score
    Given technicalDebt=5 and riskVisibility=5 and all agile indicators at 0
    Then the tradAgile score is 0
