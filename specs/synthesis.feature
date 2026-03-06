Feature: Synthesis
  The synthesis module detects contradictions between panel members,
  computes weighted findings, and assembles the synthesis prompt.
  A contradiction is a dimension where panel members' flagged status differs.
  A weighted finding is a flagged dimension with a consensus count.

  Background:
    Given panel views have been computed for SUNI, PETER, and DAVOS

  # ---------------------------------------------------------------------------
  # Contradiction detection
  # ---------------------------------------------------------------------------

  Scenario: No contradictions when all members agree
    Given all three panel members flag the same dimensions
    Then contradictions is an empty array

  Scenario: Contradiction detected when members disagree on a dimension
    Given DAVOS flags COMPLEXITY
    And SUNI does not flag COMPLEXITY
    And PETER does not flag COMPLEXITY
    Then a contradiction exists for dimension COMPLEXITY
    And the contradiction names DAVOS as flagging and SUNI and PETER as not flagging

  Scenario: Contradiction detected when two members disagree with one
    Given SUNI and PETER flag COST
    And DAVOS does not flag COST
    Then a contradiction exists for dimension COST

  Scenario: Multiple contradictions can exist simultaneously
    Given DAVOS flags COMPLEXITY but SUNI and PETER do not
    And SUNI flags COST but DAVOS and PETER do not
    Then two contradictions are detected

  Scenario: Contradiction object contains dimension and disagreeing members
    When a contradiction is detected for COMPLEXITY
    Then the contradiction object contains: dimension, flaggedBy, notFlaggedBy

  # ---------------------------------------------------------------------------
  # Weighted findings
  # ---------------------------------------------------------------------------

  Scenario: Dimension flagged by all three members produces CRITICAL consensus
    Given all three members flag TIME
    Then the weighted finding for TIME has consensus "CRITICAL"

  Scenario: Dimension flagged by two members produces HIGH consensus
    Given PETER and DAVOS flag QUALITY
    And SUNI does not flag QUALITY
    Then the weighted finding for QUALITY has consensus "HIGH"

  Scenario: Dimension flagged by one member produces MEDIUM consensus
    Given only DAVOS flags COMPLEXITY
    Then the weighted finding for COMPLEXITY has consensus "MEDIUM"

  Scenario: Unflagged dimension does not appear in weighted findings
    Given no member flags COST
    Then COST does not appear in weightedFindings

  Scenario: Weighted findings are ordered by consensus weight descending
    Given CRITICAL, HIGH, and MEDIUM findings exist
    Then weightedFindings are ordered: CRITICAL first, MEDIUM last

  # ---------------------------------------------------------------------------
  # Synthesis prompt
  # ---------------------------------------------------------------------------

  Scenario: Synthesis prompt is a non-empty string
    When the synthesis prompt is built from a complete SynthesisReport
    Then the prompt is a non-empty string of at least 300 characters

  Scenario: Synthesis prompt includes all three panel member perspectives
    When the synthesis prompt is built
    Then the prompt references SUNI and PETER and DAVOS

  Scenario: Synthesis prompt surfaces contradictions
    Given contradictions exist in the report
    When the synthesis prompt is built
    Then the prompt instructs surfacing contradictions explicitly

  Scenario: Synthesis prompt surfaces weighted findings
    Given weighted findings exist in the report
    When the synthesis prompt is built
    Then the prompt instructs weighting findings agreed by multiple members

  Scenario: Synthesis prompt includes archetype and trad/agile
    When the synthesis prompt is built
    Then the prompt includes the archetype label and trad/agile label

  Scenario: Synthesis prompt is deterministic
    Given the same SynthesisReport applied twice
    Then both synthesis prompts are identical
