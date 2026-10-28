# Code-a-Cuisine

AI-powered recipe generator — enter the ingredients you have at home and get personalized recipe suggestions.

Built with Angular 21, Swisscom myAI (GLM, via n8n), and Firebase.

---

## Prerequisites

- [Node.js](https://nodejs.org/) v20 or higher
- [Angular CLI](https://angular.dev/tools/cli) v21

```bash
npm install -g @angular/cli
```

---

## Getting Started

**1. Clone the repository**

```bash
git clone <repo-url>
cd codeacuisine
```

**2. Install dependencies**

```bash
npm install
```

**3. Start the development server**

```bash
ng serve
```

Open your browser at `http://localhost:4200`.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | Angular 21, Signals, Reactive Forms |
| Styling    | SCSS + BEM                        |
| AI Model   | Swisscom myAI, glm-5.3-flash (via n8n) |
| Automation | n8n                               |
| Database   | Firebase / Firestore              |
