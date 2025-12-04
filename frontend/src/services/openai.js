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