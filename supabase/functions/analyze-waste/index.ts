import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get('ONSPACE_AI_API_KEY');
    const baseUrl = Deno.env.get('ONSPACE_AI_BASE_URL');

    if (!apiKey || !baseUrl) {
      return new Response(
        JSON.stringify({ error: 'OnSpace AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageBase64, mimeType } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are an expert waste classification AI for SheCycle, a recycling app in Jalandhar, India for women waste collectors.

Analyze this image and classify the waste material. Respond ONLY with a valid JSON object:

{
  "type": "Plastic" | "Metal" | "Glass" | "Paper" | "E-waste" | "Organic" | "Unknown",
  "subtype": "specific item name (e.g. PET Bottle, Steel Rod, Glass Jar, Cardboard Box, Old Phone, Food Waste)",
  "confidence": number between 50-99,
  "ratePerKg": price per kg in rupees (Plastic=30, Metal=80, Glass=10, Paper=8, E-waste=120, Organic=5),
  "priceMin": minimum price estimate for typical quantity in rupees,
  "priceMax": maximum price estimate for typical quantity in rupees,
  "estimatedWeight": realistic estimated weight in kg as a number (be specific e.g. 0.5, 1.2, 3.0),
  "icon": single emoji representing the waste type,
  "description": "One sentence describing what you see in the image",
  "recyclable": true | false,
  "recyclingInstructions": [
    "Step 1: specific instruction",
    "Step 2: specific instruction",
    "Step 3: specific instruction"
  ],
  "environmentalImpact": "One sentence about the environmental benefit of recycling this specific waste",
  "funFact": "One interesting fact about recycling this material in India"
}

Important:
- Provide realistic weight estimates based on the item visible
- priceMin and priceMax should reflect a realistic range (priceMin = estimatedWeight * ratePerKg * 0.8, priceMax = estimatedWeight * ratePerKg * 1.2)
- recyclingInstructions should be practical steps relevant to India
- If the image does not contain recyclable waste, use type "Unknown"
- Always respond with valid JSON only`;

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType || 'image/jpeg'};base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OnSpace AI error:', errText);
      return new Response(
        JSON.stringify({ error: `AI error: ${errText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';

    console.log('AI raw response:', content);

    // Extract JSON from response - handle markdown code blocks
    let jsonStr = content;
    const codeBlockMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1];
    } else {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) jsonStr = jsonMatch[0];
    }

    if (!jsonStr) {
      return new Response(
        JSON.stringify({ error: 'Could not parse AI response', raw: content }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = JSON.parse(jsonStr.trim());

    // Ensure rate is set correctly
    const rateMap: Record<string, number> = {
      Plastic: 30, Metal: 80, Glass: 10, Paper: 8, 'E-waste': 120, Organic: 5,
    };
    result.ratePerKg = result.ratePerKg || rateMap[result.type] || 30;
    result.estimatedWeight = result.estimatedWeight || 1.0;
    result.priceMin = result.priceMin || +(result.estimatedWeight * result.ratePerKg * 0.8).toFixed(2);
    result.priceMax = result.priceMax || +(result.estimatedWeight * result.ratePerKg * 1.2).toFixed(2);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('analyze-waste error:', err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
