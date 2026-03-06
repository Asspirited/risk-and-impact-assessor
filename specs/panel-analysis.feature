Feature: Panel analysis
  Three panel members — Suni (Business Stakeholder), Peter (Project Manager),
  Davos (Development Team) — each assess the same dimension scores through
  their role's weighting lens.
  Each produces a PanelView: weighted scores per dimension and flagged dimensions.
  Each produces a system prompt for AI narrative generation.

  Background:
    Given dimension scores have been computed from valid sub-criteria

  # ---------------------------------------------------------------------------
  # Panel member definitions
  # ---------------------------------------------------------------------------

  Scenario: Panel contains exactly three members
    Then the panel contains members: SUNI, PETER, DAVOS

  Scenario Outline: Each panel member has a dimension weight for all seven dimensions
    Then panel member <member> has a weight for each of: SCOPE, COST, TIME, QUALITY, COMPLEXITY, UNCERTAINTY, RAID

    Examples:
      | member |
      | SUNI   |
      | PETER  |
      | DAVOS  |

  # ---------------------------------------------------------------------------
  # Dimension weighting
  # ---------------------------------------------------------------------------

  Scenario: Suni weights COST and TIME most heavily
    Then SUNI's weight for COST is the highest or joint-highest of her weights
    And SUNI's weight for COMPLEXITY is 0

  Scenario: Peter weights TIME and RAID most heavily
    Then PETER's weight for TIME is the highest or joint-highest of his weights
    And PETER's weight for RAID is the highest or joint-highest of his weights

  Scenario: Davos weights QUALITY, COMPLEXITY and UNCERTAINTY most heavily
    Then DAVOS's weight for QUALITY is the highest or joint-highest of his weights
    And DAVOS's weight for COMPLEXITY is the highest or joint-highest of his weights
    And DAVOS's weight for COST is the lowest of his weights

  # ---------------------------------------------------------------------------
  # PanelView computation
  # ---------------------------------------------------------------------------

  Scenario: PanelView contains a weighted score for each dimension
    When panel views are computed for all dimension scores at 0
    Then each panel member's PanelView contains a weightedScore for all seven dimensions
    And all weighted scores are 0

  Scenario: Weighted score is dimension score multiplied by member weight
    Given SCOPE dimension score is 3
    And SUNI's weight for SCOPE is 3
    When SUNI's PanelView is computed
    Then SUNI's weighted score for SCOPE is 9

  Scenario: A dimension is flagged when its weighted score exceeds the threshold
    Given TIME dimension score is 4
    And PETER's weight for TIME is 5
    When PETER's PanelView is computed
    Then TIME is flagged in PETER's view

  Scenario: A dimension with zero weight is never flagged regardless of score
    Given COMPLEXITY dimension score is 5
    And SUNI's weight for COMPLEXITY is 0
    When SUNI's PanelView is computed
    Then COMPLEXITY is not flagged in SUNI's view

  Scenario: flaggedDimensions lists only dimensions above threshold
    Given all dimension scores are 1
    When panel views are computed
    Then flaggedDimensions for each member contains only dimensions above their threshold

  # ---------------------------------------------------------------------------
  # Prompt assembly
  # ---------------------------------------------------------------------------

  Scenario Outline: Each panel member produces a non-empty system prompt
    When the <member> prompt is built from a valid SynthesisReport
    Then the prompt is a non-empty string of at least 200 characters

    Examples:
      | member |
      | SUNI   |
      | PETER  |
      | DAVOS  |

  Scenario: Suni prompt reflects business stakeholder perspective
    When the SUNI prompt is built
    Then the prompt contains reference to business outcomes or ROI or investment

  Scenario: Peter prompt reflects project management perspective
    When the PETER prompt is built
    Then the prompt contains reference to schedule or delivery or governance

  Scenario: Davos prompt reflects development team perspective
    When the DAVOS prompt is built
    Then the prompt contains reference to technical or complexity or feasibility

  Scenario: All three prompts include the project name
    When prompts are built for a project named "Project Albatross"
    Then all three prompts contain "Project Albatross"

  Scenario: All three prompts include dimension scores
    When prompts are built from computed dimension scores
    Then each prompt references the dimension scores

  Scenario: Three panel member prompts are all distinct
    When all three prompts are built from the same input
    Then all three prompts are different strings
