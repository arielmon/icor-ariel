This guide provides a comprehensive framework for creating a document on how to prompt with Claude, drawing on best practices for clarity, structure, reasoning, and advanced workflows.
--------------------------------------------------------------------------------
Comprehensive Guide to Prompting with Claude
Prompt engineering ensures that Claude, which operates like a brilliant but amnesiac new employee needing explicit instructions, delivers high-quality, targeted responses.
I. Foundational Principles: Clarity, Context, and Role
The golden rule of clear prompting is to be clear, direct, and detailed. The more precisely you explain what you want, the better Claudeâ€™s response will be.
A. Be Explicit and Specific
1. Be Specific about Output: Explicitly state what you want Claude to do (e.g., "output only code and nothing else").
2. Provide Sequential Steps: Use numbered lists or bullet points to ensure Claude carries out the task in the exact way you want.
3. Use Explicit Modifiers (Claude 4 Best Practice): Claude 4 models (including Opus 4.1, Sonnet 4.5, etc.) respond well to clear, explicit instructions. For "above and beyond" behavior, you must explicitly request it. For example, instead of a simple request, add: â€œInclude as many relevant features and interactions as possible. Go beyond the basics to create a fully-featured implementationâ€.
4. Action vs. Suggestion: For tool usage, be explicit if you want Claude to take action (e.g., "Change this function to improve its performance") rather than just suggest changes.
B. Provide Contextual Information
Claude performs better when given contextual information. This helps Claude 4 models better understand your goals. Examples of context include:
â€¢ What the task results will be used for.
â€¢ What audience the output is meant for.
â€¢ What workflow the task is part of.
â€¢ The end goal or what a successful task completion looks like.
â€¢ The motivation behind instructions (e.g., explaining why not to use ellipses because a text-to-speech engine will read the response).
C. Give Claude a Role (System Prompts)
Use the system parameter in the API to give Claude a role (role prompting). This is the most powerful way to use system prompts.
â€¢ Set the Role: Define Claude as a virtual domain expert (e.g., "General Counsel of a Fortune 500 tech company").
â€¢ Placement: Put the role in the system parameter and task-specific instructions in the user turn.
â€¢ Benefits: Role prompting enhances accuracy in complex scenarios (like legal or financial analysis), tailors the tone, and improves focus within specific task requirements.
II. Structuring Your Prompt Content
Using structuring techniques ensures Claude correctly interprets different parts of your request (instructions, context, examples).
A. Use XML Tags
XML tags are essential for structure, clarity, and accuracy.
â€¢ Separation: Use tags like <instructions>, <example>, <data>, or <contract> to clearly separate different parts of your prompt. This prevents Claude from mixing up instructions or context.
â€¢ Consistency: Use the same tag names consistently and refer to those tag names when discussing the content (e.g., "Using the contract in <contract> tags...").
â€¢ Nesting: Nest tags (e.g., <outer><inner></inner></outer>) for hierarchical content.
â€¢ Output Parseability: Ask Claude to use XML tags in its output (e.g., summarizing findings in <findings> tags) to make it easier to extract specific parts of its response programmatically.
B. Long Context Prompting Tips
For long documents or inputs (~20K+ tokens), specific placement and structuring are necessary.
â€¢ Prioritize Data Placement: Put longform data at the top of your prompt, above your query, instructions, and examples. Placing the query at the end can improve response quality by up to 30%.
â€¢ Multi-Document Structure: Wrap multiple documents in <document> tags, including <source> and <document_content> subtags for clear indexing.
â€¢ Grounding Responses: Ask Claude to quote relevant parts of the documents first, placing these quotes in <quotes> tags, before carrying out the main task. This helps Claude focus on the relevant information.
III. Controlling the Output Format and Behavior
These techniques force consistency and reduce unwanted commentary or formatting.
A. Use Examples (Multishot Prompting)
Providing examples (few-shot or multishot prompting) is highly effective for tasks requiring consistent structure or style.
â€¢ Quantity: Include 3-5 diverse, relevant examples for best performance.
â€¢ Structure: Wrap examples in <example> tags, often nested within <examples> tags.
â€¢ Coverage: Ensure examples cover edge cases and vary enough to prevent Claude from picking up on unintended patterns.
B. Prefill Claude's Response
You can guide Claude's responses by prefilling the Assistant message. This technique is powerful for output control but is only available for non-extended thinking modes.
â€¢ Skip Preamble/Force Format: Prefilling with { forces Claude to skip the preamble and directly output a JSON object, making the output cleaner and easier to parse.
â€¢ Maintain Character: Prefilling a bracketed [ROLE_NAME] can help maintain character consistency, especially when combined with role prompting.
â€¢ Technical Note: The prefill content cannot end with trailing whitespace.
C. Control Formatting
When steering output formatting with Claude 4 models:
â€¢ Focus on the Positive: Tell Claude what to do instead of what not to do (e.g., instead of "Do not use markdown," try "Your response should be composed of smoothly flowing prose paragraphs").
â€¢ Match Style: Match the formatting style used in your prompt to your desired output style (e.g., removing markdown from your prompt can reduce markdown in the output).
â€¢ Explicit Guidance: Use detailed prompts to minimize excessive markdown, bullet points, and short sentences, encouraging clear, flowing prose.
IV. Advanced Reasoning and Workflow Techniques
For tasks requiring deep analysis, multiple steps, or long-term focus, these techniques are crucial.
A. Let Claude Think (Chain of Thought - CoT)
CoT prompting encourages Claude to break down complex tasks step-by-step, improving accuracy, coherence, and providing insight for debugging. Use CoT for tasks that require analysis, problem-solving, or complex decision-making.
The complexity of CoT prompting can be ordered:
1. Basic Prompt: Include "Think step-by-step" in your prompt.
2. Guided Prompt: Outline specific steps for Claude to follow in its thinking process.
3. Structured Prompt: Use XML tags like <thinking> or <scratchpad> to separate the reasoning from the final answer (e.g., use <email> or <answer> for the final output).
B. Chain Complex Prompts
Prompt chaining involves breaking down complex tasks into smaller, manageable subtasks, which is vital for multi-step processes like research synthesis or iterative content creation.
â€¢ Process:
    1. Identify Subtasks: Break the main task into distinct, sequential steps.
    2. Single Goal: Each subtask should have a single, clear objective.
    3. Structure Handoffs: Use XML tags to pass the output from one prompt (the Assistant response) as the input (in the User turn) for the next prompt.
â€¢ Advanced Use: Implement self-correction chains where Claude reviews its own work (Prompt 2 provides feedback on Prompt 1's output, and Prompt 3 refines the summary based on that feedback).
C. Leverage Extended Thinking
Extended thinking allows Claude to work through complex problems with longer reasoning time.
â€¢ Generalized Instructions: Start with general, high-level instructions (e.g., "Please think about this math problem thoroughly and in great detail") rather than prescriptive, step-by-step guidance, as Claude's creativity may lead to better approaches.
â€¢ Self-Correction: Use natural language prompting to improve consistency and reduce errors by asking Claude to verify its work with a simple test or analyze whether its previous step achieved the expected result before declaring a task complete.
â€¢ Long Outputs: For very long outputs (e.g., 20,000+ words), request a detailed outline with word counts down to the paragraph level, and then ask Claude to index its paragraphs to that outline.
D. State Management (for Long-Horizon Agentic Tasks)
When tasks span multiple context windows (especially with Claude Sonnet 4.5), effective state tracking is crucial.
â€¢ Structured State: Use JSON or other structured formats for tracking data like test results or task status.
â€¢ Unstructured Progress: Use freeform progress notes (unstructured text) for tracking general progress and context.
â€¢ Tests and Tools: Have the model write tests in a structured format (e.g., tests.json) and encourage it to create setup scripts (e.g., init.sh) to gracefully start servers or run test suites when resuming work.
â€¢ Git: Claude Sonnet 4.5 performs especially well when using git to track state across multiple sessions.
V. Enhancing Specific Task Outputs
Task Area
Prompting Recommendation
Source
Research/Synthesis
Provide clear success criteria, encourage source verification, and use a structured approach (e.g., "develop several competing hypotheses" and "track confidence levels").
Document Creation
Request specific design elements: "Create a professional presentation on [topic]. Include thoughtful design elements, visual hierarchy, and engaging animations where appropriate".
Frontend/Visual Code
Provide explicit encouragement for creativity ("Don't hold back"), specify aesthetic direction (color palette, typography), and request specific features (hover states, animations).
Coding/Testing
Instruct Claude to focus on a high-quality, general-purpose solution. Tell Claude not to hard-code values, create helper scripts/workarounds, or focus too heavily on merely passing tests.
Minimizing Hallucination
For coding, instruct Claude to investigate and read relevant files BEFORE answering questions about the codebase ("Never speculate about code you have not opened").
Parallel Tool Use
To maximize efficiency, explicitly instruct Claude to call independent tools simultaneously ("Maximize use of parallel tool calls where possible to increase speed and efficiency").
Cleanup
If Claude creates temporary files during agentic coding, instruct it to clean up these files by removing them at the end of the task.