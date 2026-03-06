Feature: Persona commentary
  After an AssessmentReport is produced, the user can request commentary from one of four personas.
  Persona selection uses a tab strip (Nielsen H4 consistency, mobile touch-friendly).
  Commentary is fetched from the Cloudflare Worker proxy and streamed into the UI.
  Loading state is shown during the API call (Nielsen H1 visibility of system status).
  Errors are shown as readable messages (Nielsen H9 error recovery).

  Background:
    Given an AssessmentReport has been produced for "Project Albatross"
    And the persona commentary section is visible below the results

  # ---------------------------------------------------------------------------
  # Persona selection
  # ---------------------------------------------------------------------------

  Scenario: Four persona tabs are displayed
    Then the following persona tabs are visible:
      | Label        |
      | Paul Weller  |
      | The Skeptic  |
      | The Coach    |
      | The Auditor  |

  Scenario: No persona is selected by default
    Then no persona tab is active
    And the commentary area is empty

  Scenario: Selecting a persona activates its tab
    When the user clicks the "Paul Weller" tab
    Then the "Paul Weller" tab is active
    And the other tabs are inactive

  # ---------------------------------------------------------------------------
  # Fetching commentary
  # ---------------------------------------------------------------------------

  Scenario: Selecting a persona triggers a commentary request
    When the user clicks the "Paul Weller" tab
    Then a request is sent to the Worker proxy
    And the request contains the assembled WELLER system prompt
    And the request contains the project name

  Scenario: A loading indicator is shown while commentary is being fetched
    When the user clicks any persona tab
    Then a loading indicator is visible in the commentary area
    And the persona tabs are disabled during loading

  Scenario: Commentary is displayed when the Worker responds
    Given the Worker returns a commentary string
    When the response is received
    Then the commentary text is rendered in the commentary area
    And the loading indicator is hidden
    And the persona tabs are re-enabled

  Scenario: Switching personas fetches new commentary
    Given commentary from "The Skeptic" is displayed
    When the user clicks the "The Coach" tab
    Then the previous commentary is replaced
    And a new request is sent to the Worker proxy with the COACH prompt

  Scenario: Commentary is cached for the current assessment
    Given commentary from "Paul Weller" has already been fetched
    When the user clicks "Paul Weller" again
    Then no new request is sent to the Worker proxy
    And the cached commentary is displayed immediately

  # ---------------------------------------------------------------------------
  # Error handling
  # ---------------------------------------------------------------------------

  Scenario: Worker error is shown as a readable message
    Given the Worker returns an error response
    When the response is received
    Then the loading indicator is hidden
    And a readable error message is displayed in the commentary area
    And the persona tabs are re-enabled

  Scenario: Network failure is handled gracefully
    Given the Worker is unreachable
    When the user clicks a persona tab
    Then a readable error message is displayed
    And the user is not shown a raw stack trace or JSON error object

  # ---------------------------------------------------------------------------
  # Reset
  # ---------------------------------------------------------------------------

  Scenario: Resetting the assessment clears persona commentary and selection
    Given commentary is displayed for "The Auditor"
    When the user clicks Reset
    Then no persona tab is active
    And the commentary area is empty
    And any cached commentary is discarded
