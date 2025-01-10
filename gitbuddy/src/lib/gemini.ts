import {GoogleGenerativeAI} from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
    model : 'gemini-1.5-flash'
})

export const aiSummariseCommit = async (diff : string) => {
    try {
    const response = await model.generateContent([
        `You are an expert programmer, and you are trying to summarize a git diff.
        Reminders about the git diff format:
        For every file, there are a few metadata lines, like (for example):
        diff --git a/lib/index.js b/lib/index.js
        index aadf691..bfef603 100644
        --- a/lib/index.js
        +++ b/lib/index.js
        This means that 'lib/index.js' was modified in this commit. Note that this is only an example.
        Then there is a specifier of the lines that were modified.
        A line starting with '+' means it was added.
        A line starting with '-' means that line was deleted.
        A line that starts with neither '+' nor '-' is code given for context and better understanding.
        It is not part of the diff.
        EXAMPLE SUMMARY COMMENTS:
        Raised the amount of returned recordings from 10 to 100 (packages/server/recordings_api.ts), (packages/server/constants.ts)
        Fixed a typo in the github action name (.github/workflows/gpt-commit-summarizer.yml)
        Moved the 'octokit' initialization to a separate file (src/octokit.ts), (src/index.ts)
        Added an OpenAI API for completions (packages/utils/apis/openai.ts)
        Lowered numeric tolerance for test files
        The last comment does not include the file names because there were more than two relevant files in the hypothetical commit.
        Do not include parts of the example in your summary. It is given only as an example of appropriate comments.
        Please summarise the following diff file: ${diff}`
    ]);
    const summary = response.response.text();
    return summary.trim() === "" ? "No summary available" : summary;
} catch (error) {
    console.error("Error during AI commit summarization:" , error);
}

}