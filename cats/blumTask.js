import axios from 'axios';
import { promises as fs } from 'fs';
import fetch from 'node-fetch';
import readline from "readline-sync";

async function extractTaskIds(data) {
    const taskIds = [];

    data.forEach(category => {
        category.tasks.forEach(task => {
            // Check if the task should be ignored
            // console.log(task)
            if (task.title && 
                task.title === 'Invite' || 
                task.title === 'Farm' || 
                task.title === "Connect ton wallet" ||
                task.title === "Join or create tribe"
            ) {
                // console.log("Have A title forbiden")
                return; // Skip this task
            }

            // Add task ID to the list
            taskIds.push(task.id);

            // Check for subtasks and add their IDs
            if (task.subTasks) {
                task.subTasks.forEach(subtask => {
                    // console.log("Subtask is here")
                    taskIds.push(subtask.id);
                });
            }
        });
    });

    return taskIds;
}

async function getTask(token) {
    const config = {
        url: `https://game-domain.blum.codes/api/v1/tasks`,
        method: 'GET',
        headers: {
            'Host': 'game-domain.blum.codes',
            'sec-ch-ua': '"Not)A;Brand";v="99", "Microsoft Edge";v="127", "Chromium";v="127", "Microsoft Edge WebView2";v="127"',
            'accept': 'application/json, text/plain, */*',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
            'sec-ch-ua-platform': '"Windows"',
            'origin': 'https://telegram.blum.codes',
            'sec-fetch-site': 'same-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8',
            'priority': 'u=1, i',
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': 'Bearer ' + token + ''
        }
    };
    try {
        const response = await axios(config);
        const getTaskAll = await extractTaskIds(response.data)
        console.log(getTaskAll)
        // console.log(`Total ids : ${getAll.length()}`)
        return getTaskAll
        // const responseData = response.data[1].tasks;
        // const ids = responseData.map(task => task.id);

        // return ids;

    } catch (err) {
        console.error(err);
        return null;
    }
}

async function verifyTask(taskId, token) {
    const config = {
        url: `https://game-domain.blum.codes/api/v1/tasks/${taskId}/claim`,
        method: 'POST',
        headers: {
            'Host': 'game-domain.blum.codes',
            'sec-ch-ua': '"Not)A;Brand";v="99", "Microsoft Edge";v="127", "Chromium";v="127", "Microsoft Edge WebView2";v="127"',
            'accept': 'application/json, text/plain, */*',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
            'sec-ch-ua-platform': '"Windows"',
            'origin': 'https://telegram.blum.codes',
            'sec-fetch-site': 'same-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8',
            'priority': 'u=1, i',
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': 'Bearer ' + token + ''
        }
    };
    try {
        const response = await axios(config);
        const responseData = response.data;
        // console.log(responseData)
    } catch (err) {
        // console.error(`Error processing :`, err);
    }
}

async function startTask(taskId, token) {
    const config = {
        url: `https://game-domain.blum.codes/api/v1/tasks/${taskId}/start`,
        method: 'POST',
        headers: {
            'Host': 'game-domain.blum.codes',
            'sec-ch-ua': '"Not)A;Brand";v="99", "Microsoft Edge";v="127", "Chromium";v="127", "Microsoft Edge WebView2";v="127"',
            'accept': 'application/json, text/plain, */*',
            'sec-ch-ua-mobile': '?0',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
            'sec-ch-ua-platform': '"Windows"',
            'origin': 'https://telegram.blum.codes',
            'sec-fetch-site': 'same-site',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'accept-language': 'en-GB,en;q=0.9,en-US;q=0.8',
            'priority': 'u=1, i',
            'content-type': 'application/x-www-form-urlencoded',
            'authorization': 'Bearer ' + token + ''
        }
    };
    try {
        const response = await axios(config);
        const responseData = response.data;
        // console.log(responseData)
    } catch (err) {
        // console.error(`Error processing :`, err);
    }
}

async function processTasks(id, token, loop) {
    try {
        const taskPromises = [];

        for (let i = 0; i < loop; i++) { // Loop 20 times to create race conditions
            taskPromises.push(verifyTask(id, token));
        }

        await Promise.all(taskPromises); // Execute all requests concurrently

    } catch (err) {
        // console.error(`Error :`, err);
    }
}
async function getNewToken(queryId) {
    // Headers for the HTTP request
    const headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Content-Type": "application/json",
        "Origin": "https://telegram.blum.codes",
        "Priority": "u=1, i",
        "Referer": "https://telegram.blum.codes/"
    };

    // Data to be sent in the POST request
    const body = JSON.stringify({ query: queryId });

    // URL endpoint
    const url = "https://gateway.blum.codes/v1/auth/provider/PROVIDER_TELEGRAM_MINI_APP";

    // Try to get the token up to 3 times
    for (let attempt = 0; attempt < 3; attempt++) {
        console.log("Getting token...");

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: body
            });

            if (response.ok) {
                const responseJson = await response.json();
                return responseJson.token.refresh;
            } else {
                const errorJson = await response.json();
                console.error(`Failed to get token, attempt ${attempt + 1}:`, errorJson);
            }
        } catch (error) {
            console.error(`Error on attempt ${attempt + 1}:`, error);
        }
    }

    // If all attempts fail
    console.error("Failed to get token after 3 attempts.");
    return null;
}
async function getUserInfo(token) {
    // Headers for the HTTP request
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://telegram.blum.codes',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0'
    };

    // URL endpoint
    const url = 'https://gateway.blum.codes/v1/user/me';

    try {
        const response = await fetch(url, { headers: headers });

        if (response.ok) {
            // If response is successful, return the user info
            return await response.json();
        } else {
            const result = await response.json();

            if (result.message === 'Token is invalid') {
                console.log("Token is invalid, obtaining a new token...");

                // Get a new token
                const newToken = await getNewToken();

                if (newToken) {
                    console.log("New token obtained, retrying...");
                    // Recursively call the function with the new token
                    return getUserInfo(newToken);
                } else {
                    console.log("Failed to get a new token.");
                    return null;
                }
            } else {
                console.log("Failed to get user information.");
                return null;
            }
        }
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

async function updateTaskIds(token) {
    try {
        let taskId = []
        taskId = [
            "58f16842-9e8c-4ff0-bcac-3e9eaf237933",
            "6477d4b1-89b5-4405-9410-f6d880abed38",
            "b8c38802-7bb9-405e-a852-0c17d5c09c9b",
            "f67bc8ee-deff-4d57-ac14-060473b084ab",
            "f473ac7c-1941-4edd-b04b-0580f962e6db",
            "dafe118b-2602-43e7-a489-ebe50ca6ed0d",
            "8b2324a1-931c-4061-81d7-f759f1653001",
            "ae435cd3-fab6-4d40-8218-55bc61d6d8c3",
            "15b51a11-a19c-420f-b0ac-c4e9be2f5e07",
            "0f5fb56c-60ab-479c-88b8-ec9e9d2e9281",
            "4bd87033-015a-415c-ab9c-eae720bbfcfe",
            "83b5fa87-bb66-469c-9e79-183936d59958",
            "0e503771-5527-4ec4-a4db-352e6124ab42",
            "5bbd3482-400a-4860-8e47-2bcc42ac9c49",
            "cb22f8ec-cc2f-49cb-8eb9-add09fad3682",
            "34c97e43-3e25-4240-834a-54e34029ca7a",
            "d478fff3-945e-4b30-95c2-3470042027e3",
            "817dbad3-3290-4dc3-aa99-846d5f09d46d",
            "0f3d4955-cf79-4cff-afdf-33de9d38728a",
            "2140351e-b0d2-465e-adab-949d1735dc6e",
            "57761ac3-0745-4cd2-be8b-e4231dfc92b5",
        ]

        // Get new task IDs from the asynchronous function
        const newTaskIds = await getTask(token);

        // Push new task IDs into the existing array
        taskId.push(...newTaskIds);

        return taskId;

        console.log('Updated task IDs:', taskId);
    } catch (error) {
        console.error('Error updating task IDs:', error);
    }
}

async function getBalance(token) {
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://telegram.blum.codes',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36 Edg/125.0.0.0'
    };

    const url = 'https://game-domain.blum.codes/api/v1/user/balance';

    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            console.log(`Attempt ${attempt}: Fetching balance...`);
            const response = await fetch(url, { method: 'GET', headers });
            if (response.ok) {
                const data = await response.json();
                console.log('Successfully fetched balance');
                return data;
            } else {
                console.log(`Failed to fetch balance, attempt ${attempt}`);
            }
        } catch (error) {
            console.error(`Error during fetch: ${error.message}`);
        }
    }

    console.error('Failed to get balance after 3 attempts.');
    return null;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    try {
        const data = await fs.readFile('query.txt', 'utf8');
        const lines = data.split('\n');
        const loop = 100;
        for (const line of lines) {
            const queryId = line.trim();
            const token = await getNewToken(queryId)
            // console.log(token)
            const me = await getUserInfo(token)

            console.log("Welcome " + me.username + "")

            console.log("Trying Get All Task..")

            const taskIds = await getTask(token);

            console.log(`You have ${taskIds.length} tasks and will solve for ${loop} times`)
            // const taskId = await updateTaskIds(token)
            // return;
            for (let index = 0; index < taskIds.length; index++) {
                const id = taskIds[index];
                console.log("Starting task " + id + "")
                const start = await startTask(id, token);
            };

            for (let index = 0; index < taskIds.length; index++) {
                const id = taskIds[index];
                // console.log("Starting task " + id + "")
                console.log("Finish task " + id + "")
                const claim = await processTasks(id, token, loop)
                // console.log(claim)
            };

            await sleep(60000); // Sleep for 60 seconds

            const totalBalance = await getBalance(token)
            // console.log(totalBalance)
            console.log(`Total Balance ${me.username} : ${totalBalance.availableBalance}`)
            // await processTasks(user_id, reference);
        }

    } catch (err) {
        console.error(`Error :`, err);
    }
}

main();
