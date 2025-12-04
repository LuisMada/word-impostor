import { OpenAI } from 'openai'

// Don't instantiate at module level - do it in the function

/**
 * Generate a secret word based on genre prompt
 * PoC: Simple implementation with error handling
 */
export async function generateSecretWord(genrePrompt) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured')
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a word game assistant. Generate a single simple English word (2-3 syllables, common noun) based on the given genre or theme. Respond with ONLY the word, nothing else.',
        },
        {
          role: 'user',
          content: `Generate a word for this theme: ${genrePrompt}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 10,
    })

    const word = response.choices[0].message.content.trim().toLowerCase()
    return word
  } catch (error) {
    console.error('OpenAI error:', error.message)
    // Fallback words for PoC if API fails
    const fallbackWords = ['nebula', 'dragon', 'castle', 'treasure', 'phoenix', 'wizard', 'ocean', 'mountain']
    return fallbackWords[Math.floor(Math.random() * fallbackWords.length)]
  }
}