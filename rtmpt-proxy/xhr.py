//
// Simple reverse proxy script to enable XHR requests to work with Wowza rtmpt
//

// Input POST requests get their user-agent overwritten
// This should be extended to work with fix urls only
def request(flow):
    if flow.request.method == "POST":
        flow.request.headers["User-Agent"] = "Shockwave Flash"

// Responses get an allow-origin header
def response(flow):
    flow.response.headers["Access-Control-Allow-Origin"] = "*"
