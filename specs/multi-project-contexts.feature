Feature: Multiple named project contexts
  As a user who works across several projects
  I want to save each project context separately
  So I can switch between them and ask questions against any one of them

  Scenario: Saving a project adds it to the project list
    Given no projects are saved
    When I save a project named "Project Albatross"
    Then "Project Albatross" appears in the project list

  Scenario: Saving a second project adds it without removing the first
    Given "Project Albatross" is already saved
    When I save a project named "Project Condor"
    Then both projects appear in the project list

  Scenario: Saving an existing project name overwrites it
    Given "Project Albatross" is saved with specific scores
    When I save a project named "Project Albatross" with different scores
    Then the list still contains one entry for "Project Albatross"
    And the scores reflect the new values

  Scenario: Loading a project restores its context
    Given "Project Albatross" is saved
    When I click Load next to "Project Albatross"
    Then the project name field shows "Project Albatross"
    And all sliders reflect the saved scores
    And the assessment runs and the context summary is shown

  Scenario: Deleting a project removes it from the list
    Given "Project Albatross" and "Project Condor" are saved
    When I delete "Project Albatross"
    Then only "Project Condor" remains in the list

  Scenario: Project list is hidden when no projects are saved
    Given no projects are saved
    When I view the page
    Then the project list section is not visible

  Scenario: Project list shows archetype and band for each project
    Given a project has been saved with a completed assessment
    When I view the project list
    Then each entry shows the project name, archetype label, and severity band

  Scenario: Projects persist across page loads
    Given "Project Albatross" is saved
    When I reload the page
    Then "Project Albatross" appears in the project list

  Scenario: Clearing all projects empties the list
    Given multiple projects are saved
    When I clear all projects
    Then the project list is empty
