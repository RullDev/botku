import axios from 'axios';
import crypto from 'crypto';

// Generate UUID untuk userId
const userId = crypto.randomUUID();

export async function blackbox(prompt) {
    try {
        // Mengirim POST request menggunakan axios
        const response = await axios.post('https://www.blackbox.ai/api/chat', {
            messages: [
                {
                    id: userId,
                    content: prompt,
                    role: "user"
                }
            ],
            id: userId,
            previewToken: null,
            userId: userId,
            codeModelMode: true,
            agentMode: {
                mode: true,
                id: "IzumiiHJqwUWo",
                name: "Izumii"
            },
            trendingAgentMode: {},
            isMicMode: false,
            isChromeExt: false,
            maxTokens: 1024,
            userSystemPrompt: "Realtime",
            webSearchMode: false,
            promptUrls: "",
            githubToken: null,
            clickedAnswer2: false,
            clickedAnswer3: false,
            visitFromDelta: null
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Mobile/15E148',
            }
        });

        // Output response dan hilangkan simbol $@$v= dan undefined-rv1
        if (response && response.data) {
            // Menghilangkan semua simbol yang tidak diperlukan
            const cleanedResult = response.data.replace(/\$@\$.*?\$@\$|undefined-rv1/g, '').trim();

            // Mengembalikan hasil yang sudah dibersihkan
            return cleanedResult || "Tidak ada hasil yang valid.";
        } else {
            return "No data in response.";
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

