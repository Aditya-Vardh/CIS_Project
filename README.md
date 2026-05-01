# Web Application Firewall (WAF) Rule Engine

## Overview

This project implements a lightweight **Web Application Firewall (WAF) Rule Engine** designed to detect and block malicious HTTP requests using customizable security rules. The system inspects incoming requests, matches them against predefined attack signatures, and filters suspicious traffic before it reaches the web application.

The goal of this project is to simulate how real-world Web Application Firewalls operate internally and provide hands-on understanding of **web security mechanisms, rule-based filtering systems, and request inspection workflows**.

---

## Features

* Detects common web attacks such as:

  * SQL Injection (SQLi)
  * Cross-Site Scripting (XSS)
  * Suspicious request patterns
* Rule-based filtering engine
* Real-time HTTP request inspection
* Customizable attack detection rules
* Request logging for monitoring and analysis
* Lightweight and easy-to-extend architecture

---

## Project Workflow

1. Client sends HTTP request
2. Request is intercepted by the WAF Rule Engine
3. Request is matched against predefined security rules
4. If malicious pattern detected → request blocked
5. If safe → request forwarded to application
6. Activity logged for analysis

---

## System Architecture

```
Client Request
      |
      v
WAF Rule Engine
      |
      |----> Rule Matching
      |----> Attack Detection
      |
Safe Request ------> Forward to Server
Malicious Request -> Block + Log
```

---

## Technologies Used

Example stack (modify based on your implementation):

* Python
* Flask / HTTP Server
* Regular Expressions (Regex)
* Logging Module
* Git & GitHub

---

## Installation

Clone the repository:

```
git clone https://github.com/Aditya-Vardh/CIS_Project.git
```

Navigate to project directory:

```
cd CIS_Project
```

Install dependencies:

```
pip install -r requirements.txt
```

Run the application:

```
python app.py
```

---

## Example Attack Detection

### SQL Injection Example

Input:

```
?id=1 OR 1=1
```

Result:

Blocked by WAF

---

### XSS Example

Input:

```
<script>alert("XSS")</script>
```

Result:

Blocked by WAF

---

## Logging System

The system logs:

* Incoming request details
* Attack type detected
* Timestamp
* Action taken (Allowed / Blocked)

This helps in monitoring suspicious traffic behavior.

---

## Future Improvements

Planned upgrades:

* Machine Learning-based anomaly detection
* Admin dashboard for monitoring traffic
* Dynamic rule configuration panel
* Integration with cloud deployment
* Support for advanced OWASP Top 10 threats

---

## Learning Outcomes

Through this project:

* Understood how Web Application Firewalls operate internally
* Implemented rule-based traffic filtering
* Learned detection of common web attacks
* Explored secure request handling techniques

---

## Author

**Aditya Vardhan Marisa**

B.Tech Student – KL University

Cybersecurity | Networking | Systems Projects Enthusiast

---

## License

This project is developed for educational purposes and experimentation in web security concepts.
