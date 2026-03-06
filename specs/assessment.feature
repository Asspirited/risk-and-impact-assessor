Feature: Assessment orchestration
  The assessment engine coordinates signal validation, archetype classification,
  top-signal identification, recommendation generation, and AssessmentReport assembly.
  It is the single entry point for a complete project risk assessment.

  Background:
    Given the eleven signals are: unspokenRisk, statusHiding, meetingTheater, scopeChurn,
      processRigidity, velocityDrift, qualityDrift, teamAttrition,
      metricsWithoutMeaning, stakeholderPerformance, technicalDebt
    And each signal accepts values 0–5

  # ---------------------------------------------------------------------------
  # Report shape
  # ---------------------------------------------------------------------------

  Scenario: A completed assessment produces an AssessmentReport with all required fields
    Given a project named "Project Albatross"
    And signals with unspokenRisk=5 and statusHiding=5 and all others at 0
    When I run the assessment
    Then the report contains field "projectName" with value "Project Albatross"
    And the report contains field "archetype"
    And the report contains field "archetypeLabel"
    And the report contains field "archetypeDescription"
    And the report contains field "band"
    And the report contains field "topSignals"
    And the report contains field "recommendation"
    And the report contains field "rankedArchetypes"

  Scenario: rankedArchetypes contains all five archetypes ordered by score descending
    Given a project named "Any Project"
    And signals with unspokenRisk=5 and statusHiding=5 and all others at 0
    When I run the assessment
    Then rankedArchetypes has exactly 5 entries
    And rankedArchetypes is sorted by score descending
    And rankedArchetypes[0].archetype is "HAUNTED_HOUSE"

  # ---------------------------------------------------------------------------
  # Archetype classification
  # ---------------------------------------------------------------------------

  Scenario Outline: Each archetype is reachable and correctly classified
    Given a project named "Test Project"
    And signals that maximise <archetype>
    When I run the assessment
    Then the dominant archetype is <archetype>
    And archetypeLabel is <label>

    Examples:
      | archetype     | label          |
      | HAUNTED_HOUSE | Haunted House  |
      | BOILING_FROG  | Boiling Frog   |
      | PAPER_TIGER   | Paper Tiger    |
      | CARGO_CULT    | Cargo Cult     |
      | SLOW_BURN     | Slow Burn      |

  # ---------------------------------------------------------------------------
  # Top signals
  # ---------------------------------------------------------------------------

  Scenario: Top signals reflect the highest-contributing signals for the dominant archetype
    Given a project named "Test Project"
    And signals with processRigidity=5 and meetingTheater=5 and all others at 0
    When I run the assessment
    Then the dominant archetype is "CARGO_CULT"
    And topSignals contains "processRigidity"
    And topSignals contains "meetingTheater"

  Scenario: Top signals returns exactly 3 entries by default
    Given a project named "Test Project"
    And signals with unspokenRisk=5 and statusHiding=4 and meetingTheater=3 and all others at 0
    When I run the assessment
    Then topSignals has exactly 3 entries

  Scenario: Top signals are ordered by contribution descending
    Given a project named "Test Project"
    And signals with unspokenRisk=5 and statusHiding=3 and meetingTheater=1 and all others at 0
    When I run the assessment
    Then the dominant archetype is "HAUNTED_HOUSE"
    And topSignals[0] is "unspokenRisk"

  Scenario: Top signals only includes signals that contributed a non-zero score
    Given a project named "Test Project"
    And signals with technicalDebt=5 and all others at 0
    When I run the assessment
    Then the dominant archetype is "SLOW_BURN"
    And topSignals contains "technicalDebt"
    And topSignals does not contain "unspokenRisk"

  # ---------------------------------------------------------------------------
  # Recommendations
  # ---------------------------------------------------------------------------

  Scenario Outline: Each archetype produces a distinct non-empty recommendation
    Given a project named "Test Project"
    And signals that maximise <archetype>
    When I run the assessment
    Then recommendation is a non-empty string
    And recommendation is specific to <archetype>

    Examples:
      | archetype     |
      | HAUNTED_HOUSE |
      | BOILING_FROG  |
      | PAPER_TIGER   |
      | CARGO_CULT    |
      | SLOW_BURN     |

  Scenario: All five archetype recommendations are distinct from each other
    Given five assessments each maximising a different archetype
    When I collect all recommendations
    Then all five recommendations are distinct strings

  # ---------------------------------------------------------------------------
  # Severity band
  # ---------------------------------------------------------------------------

  Scenario Outline: Severity band reflects the score relative to archetype maximum
    Given a project named "Test Project"
    And signals that produce a <band> score for <archetype>
    When I run the assessment
    Then the band is <band>

    Examples:
      | archetype     | band     |
      | HAUNTED_HOUSE | LOW      |
      | HAUNTED_HOUSE | MEDIUM   |
      | HAUNTED_HOUSE | HIGH     |
      | HAUNTED_HOUSE | CRITICAL |

  # ---------------------------------------------------------------------------
  # Validation
  # ---------------------------------------------------------------------------

  Scenario: Assessment rejects an empty project name
    Given an empty project name ""
    And valid signals all at 0
    When I run the assessment
    Then an error is thrown containing "projectName"

  Scenario: Assessment rejects a whitespace-only project name
    Given a project named "   "
    And valid signals all at 0
    When I run the assessment
    Then an error is thrown containing "projectName"

  Scenario: Assessment rejects signals with a missing field
    Given a project named "Test Project"
    And signals with "technicalDebt" removed
    When I run the assessment
    Then an error is thrown containing "technicalDebt"

  Scenario: Assessment rejects a signal value above 5
    Given a project named "Test Project"
    And signals with unspokenRisk=6 and all others at 0
    When I run the assessment
    Then an error is thrown containing "unspokenRisk"

  Scenario: Assessment rejects a signal value below 0
    Given a project named "Test Project"
    And signals with velocityDrift=-1 and all others at 0
    When I run the assessment
    Then an error is thrown containing "velocityDrift"

  Scenario: Assessment rejects a non-numeric signal value
    Given a project named "Test Project"
    And signals with statusHiding="high" and all others at 0
    When I run the assessment
    Then an error is thrown containing "statusHiding"

  # ---------------------------------------------------------------------------
  # Determinism
  # ---------------------------------------------------------------------------

  Scenario: Same inputs always produce identical AssessmentReports
    Given a project named "Project Albatross"
    And signals with unspokenRisk=3 and statusHiding=4 and all others at 0
    When I run the assessment twice with identical inputs
    Then both reports are deeply equal
