export const parseComplexJson = (jsonData) => {
    const cards = [];
    let idCounter = 0;

    // Helper to add a card
    const addCard = (question, answer, category) => {
        if (question && answer) {
            cards.push({
                id: idCounter++,
                question: formatText(question),
                answer: formatText(answer),
                category: formatText(category)
            });
        }
    };

    const formatText = (text) => {
        if (typeof text === 'string') return text;
        if (Array.isArray(text)) return text.join('\n• '); // Bullet points for arrays
        if (typeof text === 'object') return JSON.stringify(text); // Fallback
        return String(text);
    };

    // Main Recursive Parser
    const traverse = (obj, contextPrefix = '') => {
        if (!obj || typeof obj !== 'object') return;

        // Handle Array (likely the root list of topics)
        if (Array.isArray(obj)) {
            obj.forEach(item => traverse(item, contextPrefix));
            return;
        }

        // --- Specific Schema Handling based on user's sample ---

        // 1. Title/Topic Root
        const title = obj.title || obj.term || contextPrefix; // Current "Context"

        // 2. Definition
        if (obj.definition) {
            addCard(
                `Define: ${obj.definition.term || title}`,
                obj.definition.description,
                "Definition"
            );
            if (obj.definition.diversity) {
                addCard(
                    `Diversity of ${obj.definition.term || title}`,
                    obj.definition.diversity,
                    "Facts"
                );
            }
        }

        // 3. History
        if (obj.history) {
            Object.entries(obj.history).forEach(([era, detail]) => {
                const readableEra = era.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

                if (typeof detail === 'object' && !Array.isArray(detail)) {
                    // Key-Value pairs inside history (e.g. governance: "Autonomous...")
                    Object.entries(detail).forEach(([key, val]) => {
                        const readableKey = key.replace(/_/g, ' ');
                        addCard(
                            `${title} History (${readableEra}) - ${readableKey}?`,
                            val,
                            "History"
                        );
                    });
                } else {
                    // Array or String detail
                    addCard(
                        `${title} History: What happened during ${readableEra}?`,
                        detail,
                        "History"
                    );
                }
            });
        }

        // 4. Regional Groups / Nested Categories
        if (obj.regional_groups) {
            Object.entries(obj.regional_groups).forEach(([region, details]) => {
                const regionName = region.replace(/_/g, ' ').toUpperCase();

                if (details.groups) {
                    addCard(
                        `Indigenous Groups in ${regionName} (${title})`,
                        details.groups,
                        "Demographics"
                    );
                }

                if (details.notable_features) {
                    addCard(
                        `Notable Features of ${regionName} Groups`,
                        details.notable_features,
                        "Culture"
                    );
                }

                if (details.livelihoods) {
                    addCard(
                        `Livelihoods of ${regionName} Groups`,
                        details.livelihoods,
                        "Culture"
                    );
                }
            });
        }

        // 5. Generic Key-Value fallback for other fields (e.g., current_struggles, values_and_ethics)
        const ignoreKeys = ['title', 'definition', 'history', 'regional_groups'];
        Object.entries(obj).forEach(([key, value]) => {
            if (ignoreKeys.includes(key)) return;

            const readableKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

            // If it's a simple string or array, make a card
            if (typeof value === 'string' || Array.isArray(value)) {
                addCard(
                    `${title}: ${readableKey}?`,
                    value,
                    "General Info"
                );
            }
            // If it's an object (like legal_framework), recurse or handle specially
            else if (typeof value === 'object') {
                // Simple flatten for 1-level deep objects
                Object.entries(value).forEach(([subKey, subVal]) => {
                    const readableSubKey = subKey.replace(/_/g, ' ');
                    addCard(
                        `${title} - ${readableKey}: ${readableSubKey}?`,
                        subVal,
                        "Detailed Info"
                    );
                });
            }
        });
    };

    traverse(jsonData);
    return cards;
};
