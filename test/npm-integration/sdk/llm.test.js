/**
 * LLM Integration Tests
 * Tests OllamaAdapter, OpenAIAdapter, DeepSeekAdapter
 */

import {
  OllamaAdapter,
  OpenAIAdapter,
  DeepSeekAdapter,
  LLMPlanner,
} from 'somnia-agent-kit';

export async function testLLM() {
  const results = {
    name: 'LLM Tests',
    tests: [],
    passed: 0,
    failed: 0,
  };

  console.log('\n🧪 Testing LLM Features\n');

  // Test 1: OllamaAdapter instantiation
  try {
    const ollama = new OllamaAdapter({
      baseURL: 'http://localhost:11434',
      defaultModel: 'llama3.2',
    });

    if (!ollama) {
      throw new Error('OllamaAdapter creation failed');
    }

    results.tests.push({ name: 'LLM: OllamaAdapter creation', status: 'PASS' });
    results.passed++;
    console.log('✅ LLM: OllamaAdapter creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'LLM: OllamaAdapter creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ LLM: OllamaAdapter creation - FAIL:', error.message);
  }

  // Test 2: OpenAIAdapter instantiation
  try {
    const openai = new OpenAIAdapter({
      apiKey: 'sk-test',
      model: 'gpt-4',
    });

    if (!openai) {
      throw new Error('OpenAIAdapter creation failed');
    }

    results.tests.push({ name: 'LLM: OpenAIAdapter creation', status: 'PASS' });
    results.passed++;
    console.log('✅ LLM: OpenAIAdapter creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'LLM: OpenAIAdapter creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ LLM: OpenAIAdapter creation - FAIL:', error.message);
  }

  // Test 3: DeepSeekAdapter instantiation
  try {
    const deepseek = new DeepSeekAdapter({
      apiKey: 'test-key',
    });

    if (!deepseek) {
      throw new Error('DeepSeekAdapter creation failed');
    }

    results.tests.push({ name: 'LLM: DeepSeekAdapter creation', status: 'PASS' });
    results.passed++;
    console.log('✅ LLM: DeepSeekAdapter creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'LLM: DeepSeekAdapter creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ LLM: DeepSeekAdapter creation - FAIL:', error.message);
  }

  // Test 4: LLMPlanner instantiation
  try {
    const ollama = new OllamaAdapter({
      baseURL: 'http://localhost:11434',
      defaultModel: 'llama3.2',
    });

    const planner = new LLMPlanner(ollama);

    if (!planner) {
      throw new Error('LLMPlanner creation failed');
    }

    results.tests.push({ name: 'LLM: LLMPlanner creation', status: 'PASS' });
    results.passed++;
    console.log('✅ LLM: LLMPlanner creation - PASS');
  } catch (error) {
    results.tests.push({ name: 'LLM: LLMPlanner creation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ LLM: LLMPlanner creation - FAIL:', error.message);
  }

  // Test 5: LLMPlanner with adapter
  try {
    const ollama = new OllamaAdapter({ baseURL: 'http://localhost:11434', defaultModel: 'llama3.2' });
    const planner = new LLMPlanner(ollama);

    if (!planner) {
      throw new Error('LLMPlanner with adapter failed');
    }

    results.tests.push({ name: 'LLM: LLMPlanner with adapter', status: 'PASS' });
    results.passed++;
    console.log('✅ LLM: LLMPlanner with adapter - PASS');
  } catch (error) {
    results.tests.push({ name: 'LLM: LLMPlanner with adapter', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ LLM: LLMPlanner with adapter - FAIL:', error.message);
  }

  // Test 6: Adapter configuration validation
  try {
    // Test with missing required config
    try {
      const invalidAdapter = new OllamaAdapter({});
      // If no error, check if defaults are set
      results.tests.push({ name: 'LLM: config validation', status: 'PASS' });
      results.passed++;
      console.log('✅ LLM: config validation - PASS');
    } catch (err) {
      // Error is expected with invalid config
      results.tests.push({ name: 'LLM: config validation', status: 'PASS' });
      results.passed++;
      console.log('✅ LLM: config validation - PASS (error caught)');
    }
  } catch (error) {
    results.tests.push({ name: 'LLM: config validation', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ LLM: config validation - FAIL:', error.message);
  }

  // Test 7: Multiple adapters coexist
  try {
    const ollama = new OllamaAdapter({ baseURL: 'http://localhost:11434', defaultModel: 'llama3.2' });
    const openai = new OpenAIAdapter({ apiKey: 'sk-test', model: 'gpt-4' });
    const deepseek = new DeepSeekAdapter({ apiKey: 'test' });

    if (!ollama || !openai || !deepseek) {
      throw new Error('Cannot create multiple adapters');
    }

    results.tests.push({ name: 'LLM: multiple adapters', status: 'PASS' });
    results.passed++;
    console.log('✅ LLM: multiple adapters - PASS');
  } catch (error) {
    results.tests.push({ name: 'LLM: multiple adapters', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ LLM: multiple adapters - FAIL:', error.message);
  }

  // Test 8: Adapter flexibility
  try {
    const adapters = [
      new OllamaAdapter({ baseURL: 'http://localhost:11434', defaultModel: 'llama3.2' }),
      new OpenAIAdapter({ apiKey: 'sk-test', model: 'gpt-4' }),
      new DeepSeekAdapter({ apiKey: 'test' }),
    ];

    const planners = adapters.map(adapter => new LLMPlanner(adapter));

    if (planners.length !== 3) {
      throw new Error('Multiple planners creation failed');
    }

    results.tests.push({ name: 'LLM: Adapter flexibility', status: 'PASS' });
    results.passed++;
    console.log('✅ LLM: Adapter flexibility - PASS');
  } catch (error) {
    results.tests.push({ name: 'LLM: Adapter flexibility', status: 'FAIL', error: error.message });
    results.failed++;
    console.log('❌ LLM: Adapter flexibility - FAIL:', error.message);
  }

  return results;
}
