import { OpenAI } from 'openai'

let openaiClient = null

function getOpenAIClient() {
  if (!openaiClient) {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY environment variable is not set')
    }
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage
    })
  }
  return openaiClient
}

/**
 * Generate a secret word based on genre prompt
 */
export async function generateSecretWord(genrePrompt) {
  try {
    const openai = getOpenAIClient()

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a creative word game assistant. Your job is to generate a SPECIFIC, INTERESTING, and UNIQUE word based on the theme provided.

IMPORTANT RULES:
- Generate a single English word only (preferably a common noun)
- The word should be SPECIFIC and distinctive to the theme, NOT generic
- Avoid overly obvious/generic terms - be creative and interesting
- The word should be guessable but not too easy
- Respond with ONLY the word, nothing else (no punctuation, no explanation)
- Do NOT include articles (a, an, the) or any modifiers
- Aim for 1-4 syllables (short to medium length)

Examples:
- Theme "a character from naruto" → "sharingan" or "kunai" or "shuriken" (NOT "ninja")
- Theme "space exploration" → "supernova" or "asteroid" (NOT "space")
- Theme "medieval fantasy" → "grimoire" or "enchantment" (NOT "wizard")
- Theme "underwater creatures" → "bioluminescence" or "tentacle" (NOT "fish")`,
        },
        {
          role: 'user',
          content: `Generate a specific and interesting word for this theme: ${genrePrompt}`,
        },
      ],
      temperature: 0.8, // Increased from 0.7 for more creativity
      max_tokens: 15,
    })

    const word = response.choices[0].message.content.trim().toLowerCase()
    console.log(`✅ Secret word generated: ${word}`)
    return word
  } catch (error) {
    console.error('OpenAI error:', error.message)
    // Fallback words for PoC if API fails
    const fallbackWords = ['nebula', 'dragon', 'castle', 'treasure', 'phoenix', 'wizard', 'ocean', 'mountain']
    const word = fallbackWords[Math.floor(Math.random() * fallbackWords.length)]
    console.log(`⚠️  Using fallback word: ${word}`)
    return word
  }
}