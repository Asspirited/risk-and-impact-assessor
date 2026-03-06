Feature: Assessment form and results display
  The assessment form collects a project name and eleven signal scores.
  Signals are grouped into three themed sections to reduce cognitive load (Nielsen H8).
  Human-readable labels replace camelCase keys throughout (Nielsen H2, H6).
  The AssessmentReport is rendered immediately after local assessment runs — no API call needed.

  Background:
    Given the app is loaded in a browser
    And the eleven signals are grouped as:
      | Group                    | Signals                                                                     |
      | Culture & Communication  | unspokenRisk, statusHiding, meetingTheater, stakeholderPerformance          |
      | Execution & Flow         | velocityDrift, scopeChurn, qualityDrift, technicalDebt                     |
      | Team & Structure         | teamAttrition, processRigidity, metricsWithoutMeaning                      |

  # ---------------------------------------------------------------------------
  # Form — project name
  # ---------------------------------------------------------------------------

  Scenario: Project name field is present and labelled
    Then a text input labelled "Project name" is visible

  Scenario: Project name field accepts free text
    When the user types "Project Albatross" into the project name field
    Then the field value is "Project Albatross"

  # ---------------------------------------------------------------------------
  # Form — signal sliders
  # ---------------------------------------------------------------------------

  Scenario: Each signal group renders as an expandable section
    Then the page shows three signal group headings:
      | Culture & Communication |
      | Execution & Flow        |
      | Team & Structure        |

  Scenario: Each signal renders with a human-readable label and a range slider
    When the user expands "Culture & Communication"
    Then the following labelled sliders are visible:
      | Label                    | Signal key              |
      | Unspoken Risk            | unspokenRisk            |
      | Status Hiding            | statusHiding            |
      | Meeting Theatre          | meetingTheater          |
      | Stakeholder Performance  | stakeholderPerformance  |

  Scenario: Each slider defaults to 0
    When the user expands any signal group
    Then all sliders in that group show value 0

  Scenario: Sliders accept values 0 through 5 in steps of 1
    When the user sets "Unspoken Risk" to 3
    Then the slider value is 3
    And the displayed numeric value is 3

  Scenario: Each signal has a one-line description available on demand
    When the user activates the info control for "Unspoken Risk"
    Then a description is shown explaining what the signal means

  # ---------------------------------------------------------------------------
  # Form — submission
  # ---------------------------------------------------------------------------

  Scenario: Assess button is present
    Then a button labelled "Assess" is visible

  Scenario: Assess button is disabled when project name is empty
    Given the project name field is empty
    Then the Assess button is disabled

  Scenario: Assess button is enabled when project name is non-empty
    Given the user has typed "Project Albatross" into the project name field
    Then the Assess button is enabled

  Scenario: Submitting the form runs the local assessment and renders results
    Given the user has typed "Project Albatross" into the project name field
    And the user has set unspokenRisk to 5 and statusHiding to 5 and all others to 0
    When the user clicks Assess
    Then the results section is visible
    And the archetype label "Haunted House" is displayed prominently
    And the severity band is displayed
    And the top signals list is displayed
    And the recommendation text is displayed

  # ---------------------------------------------------------------------------
  # Results display
  # ---------------------------------------------------------------------------

  Scenario: Archetype label and description are the first result rendered
    When assessment results are shown
    Then the archetype label appears before the band
    And the archetype description appears below the label

  Scenario: Severity band is displayed with visual distinction
    When assessment results are shown
    Then the band value is one of: LOW, MEDIUM, HIGH, CRITICAL
    And the band is visually distinct from surrounding text

  Scenario: Top signals are displayed as a readable list
    When assessment results are shown
    Then top signals are shown with human-readable labels
    And camelCase signal keys are not shown to the user

  Scenario: Recommendation is displayed as full prose
    When assessment results are shown
    Then the recommendation text is shown as a paragraph

  Scenario: Full archetype ranking is shown beneath primary result
    When assessment results are shown
    Then all five archetypes are listed with their scores
    And they are ordered highest score first

  # ---------------------------------------------------------------------------
  # Reset
  # ---------------------------------------------------------------------------

  Scenario: User can reset the form to start a new assessment
    Given assessment results are shown
    When the user clicks Reset
    Then all sliders return to 0
    And the project name field is cleared
    And the results section is hidden
