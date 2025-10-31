/**
 * Extract and clean up a JSON substring from a noisy string.
 * It checks whether `{` or `[` appears first and finds the matching end.
 */
export function extractJsonString(input) {
    if (!input) return null;
  
    const firstCurly = input.indexOf('{');
    const firstSquare = input.indexOf('[');
  
    // Find which bracket comes first
    let startIndex = -1;
    let openChar = '';
    let closeChar = '';
  
    if (firstCurly === -1 && firstSquare === -1) return null;
  
    if (firstSquare !== -1 && (firstCurly === -1 || firstSquare < firstCurly)) {
      startIndex = firstSquare;
      openChar = '[';
      closeChar = ']';
    } else {
      startIndex = firstCurly;
      openChar = '{';
      closeChar = '}';
    }
  
    // Find the matching closing bracket using a stack
    let depth = 0;
    let endIndex = -1;
    for (let i = startIndex; i < input.length; i++) {
      if (input[i] === openChar) depth++;
      if (input[i] === closeChar) depth--;
      if (depth === 0) {
        endIndex = i + 1;
        break;
      }
    }
  
    if (endIndex === -1) return null;
  
    const jsonSlice = input.slice(startIndex, endIndex);
  
    return jsonSlice.trim();
  }
  