export function selectResponseGivenQuestionID(responses, questionId) {
    for(let response of responses) {
        if(response.question === questionId) {
            return response;
        }
    }
}
