Feature: Project context persistence
  As a user who revisits the tool
  I want my project context to be restored automatically
  So I do not have to re-enter it each time

  Scenario: Project state is saved when an assessment is run
    Given I have entered a project name and slider scores
    When I run an assessment
    Then the project name and sub-criteria scores are written to storage

  Scenario: Project state is restored on page load
    Given a project state was previously saved
    When the page loads
    Then the project name field is populated from saved state
    And all sub-criteria sliders are populated from saved state

  Scenario: Restored state allows immediate re-assessment
    Given a project state has been restored
    When I click Assess without changing anything
    Then the assessment runs successfully using the restored values

  Scenario: Reset clears saved state
    Given a saved project state exists in storage
    When I click Reset
    Then the project name and sliders are cleared
    And the saved state is removed from storage

  Scenario: Corrupt or missing state is handled gracefully
    Given storage contains invalid or no project state
    When the page loads
    Then the form is empty and no error is shown
