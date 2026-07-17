# DMCC style refactor sprint sequence

This sequence is the approved execution contract. Sprints are completed in order. No later sprint starts until the previous sprint is implemented, validated and accepted.

1. Mechanical audit and versioned baseline.
2. Global foundation and single cascade.
3. Shared global primitives.
4. Layouts, shells and navigation.
5. Entities: list and cards.
6. Entities: detail, summary and player character.
7. Entity relationships.
8. Onboarding and guidance.
9. Canvas.
10. Network and map.
11. Sessions.
12. History and planning.
13. People, players and messaging.
14. Administration.
15. Account, authentication and preferences.
16. Landing and institutional pages.
17. Final cleanup and zero tolerance.

Every sprint closes with a summary of completed work and the remaining sprint sequence. Local component styles may only describe component-owned elements and must consume shared global styles for global behavior. Literal visual colors remain restricted to registered theme packages, and static visual styles must leave TS/TSX.
