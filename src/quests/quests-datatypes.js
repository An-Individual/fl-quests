const QuestStates = {
    Undefined: 0,
    NotStart: 1,
    InProgress: 2,
    Blocked: 3,
    Completed: 4,
    HiddenStatus: 5
}

const LogicTypes = {
    Undefined: 0,
    Comparison: 1,
    And: 2,
    Or: 3,
    Not: 4
}

const ComparisonTypes = {
    Undefined: 0,
    Equal: 1,
    NotEqual: 2,
    Greater: 3,
    GreaterEqual: 4,
    Less: 5,
    LessEqual: 6
}

const QuestsSourceType = {
    None: 0,
    Local: 1,
    GitHub: 2,
    Custom: 3
}

const AllowedQualityProperties = [
    "level",
    "effectiveLevel"
]