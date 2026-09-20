# **SkillIntel — Frontend Development Requirements**

Hey, bro\! Here’s what we need to build on the frontend for SkillIntel. The main goal is to connect the UI with our existing FastAPI backend and make the project feel like a complete, working platform rather than just a static dashboard.

## **1\. Login Page**

Create a login page with:

* Official ID input  
* Password input  
* Sign in button  
* Loading and error states

API:

POST /api/v1/auth/demo-login

After successful login:

* Save the returned official details in frontend state.  
* Redirect to the dashboard.  
* Use the returned `official_id` for future API requests.  
* Display an error if login fails.

Backend URL:

http://127.0.0.1:8000

Swagger documentation:

http://127.0.0.1:8000/docs

## **2\. Dashboard**

The dashboard should fetch and display real data from our backend.

### **Profile section**

API:

GET /api/v1/officials/{official\_id}

Display:

* Official name  
* Designation  
* Department  
* Role  
* Other available profile information

### **Competency overview**

API:

GET /api/v1/officials/{official\_id}/competencies

Display the official's competency information using cards or a table.

### **Competency gaps**

API:

GET /api/v1/officials/{official\_id}/competency-gaps

This should be one of the main sections of the dashboard.

## **4\. Recommendations Page**

API:

GET /api/v1/officials/{official\_id}/recommendations

Display recommendations as cards containing available information such as:

* Course name  
* Related competency  
* Provider  
* Recommendation reason  
* Course URL, if available

Each course card can have:

View Course

If the API provides a course URL, the button should open that URL.

We can also include:

Why this recommendation?

This should display the explanation returned by the backend. Please don't create explanations on the frontend that aren't supported by the API response.

## **5\. Learning History**

API:

GET /api/v1/officials/{official\_id}/learning-history

Display a table containing available information such as:

* Course/training name  
* Completion status  
* Completion date  
* Provider  
* Related competency

If the POST endpoint is ready, add an Add Training Record button:

POST /api/v1/officials/{official\_id}/learning-history

After successfully adding a record:

1. Show a success message.  
2. Refresh the learning-history data.  
3. Update the relevant dashboard information.

Please confirm the exact request fields in Swagger first.

## **6\. AI Assistant**

API:

POST /api/v1/assistant/chat

Create a chat interface with:

* Message input  
* Send button  
* User messages  
* AI responses  
* Loading state  
* Error handling

We can also add quick-action buttons such as:

Explain my competency gaps  
Recommend courses for my skill gaps  
Explain my learning progress

These buttons should send messages through the same assistant API. The frontend should display the actual backend response.

## **7\. Assessments**

Please check the available assessment endpoints in Swagger before implementing this section.

Depending on the existing backend functionality, we can include:

* Start assessment  
* Display questions  
* Select answers  
* Submit assessment  
* Display results and explanations  
* Retry assessment, if supported

Don't assume request fields or endpoints that aren't implemented yet.

## **8\. Buttons and API Integration**

Every important button should have a clear purpose.

| Button | Expected action |
| ----- | ----- |
| Sign in | Send login API request |
| View competency gaps | Fetch/display competency gaps |
| View all competencies | Open competency details |
| View recommendations | Fetch recommendation data |
| View course | Open course URL if available |
| Add training record | Send POST request |
| Refresh data | Fetch the relevant endpoint again |
| Send message | Call AI assistant endpoint |
| Submit assessment | Send assessment response |

A button should not appear functional if there is no backend action or actual frontend behavior behind it.

## **9\. UI States**

Please include:

* Loading states  
* Error messages  
* Empty states  
* Success messages  
* Responsive design  
* Proper handling of failed API requests

Example:

Loading competency data...  
No learning history available.  
Unable to load recommendations. Please try again.

## **10\. Important Development Rules**

1. Use real API responses wherever our backend endpoint is available.  
2. Use Swagger (`/docs`) as the source of truth for request and response schemas.  
3. Don't hardcode official profiles, competency levels, or recommendations.  
4. Use the `official_id` returned after login.  
5. Create reusable API functions instead of repeating fetch logic everywhere.  
6. Keep the design clean, professional, and suitable for a hackathon demonstration.  
7. If an endpoint is incomplete or unavailable, let me know before building a fake frontend implementation.

### **Suggested development order**

Login  
  ↓  
Dashboard \+ Official Profile  
  ↓  
Competency Overview  
  ↓  
Competency Gap Charts  
  ↓  
Recommendations  
  ↓  
Learning History  
  ↓  
AI Assistant  
  ↓  
Assessments

Main objective: When we demonstrate SkillIntel, the judges should be able to log in, view an official's competency gaps through charts, see personalized recommendations, check learning history, and interact with the AI assistant using our actual backend APIs.

