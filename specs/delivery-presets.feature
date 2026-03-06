Feature: Delivery archetype presets
  As a user who does not want to score all 28 sub-criteria manually
  I want to load a preset based on my delivery approach
  So I can get a useful starting point and adjust from there

  Scenario: Four presets are available
    When I view the preset options
    Then I see: Traditional, Hybrid, Agile, Agile CD

  Scenario: Loading a preset populates all 28 sub-criteria
    Given I select the Traditional preset
    Then all 28 sub-criteria sliders are populated with values between 0 and 5

  Scenario: Presets produce distinct risk profiles
    When I load each of the four presets and run an assessment
    Then each produces a different set of dimension scores

  Scenario: Traditional preset scores lowest on trad/agile spectrum
    Given I load the Traditional preset
    When I run an assessment
    Then the tradAgileLabel is "Traditional"

  Scenario: Agile CD preset scores highest on trad/agile spectrum
    Given I load the Agile CD preset
    When I run an assessment
    Then the tradAgileLabel is "Agile"

  Scenario: Preset values are valid sub-criteria inputs
    Given I load any preset
    Then the inputs pass validateSubCriteria without error

  Scenario: Loading a preset does not save context automatically
    Given I load the Agile preset
    When I have not clicked Save context
    Then no project state is written to storage

  Scenario: User can adjust sliders after loading a preset
    Given I load the Hybrid preset
    When I change one slider value
    Then that sub-criterion reflects the new value when context is saved
