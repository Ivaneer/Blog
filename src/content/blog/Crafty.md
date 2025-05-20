---
title: "Crafty"
description: "Crafty"
pubDate: 2025-05-20
---

https://app.hackthebox.com/machines/Crafty

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sS -p- -T5 --min-rate=5000 -vvv -Pn -n 10.10.11.249
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240511183604.png)
La pagina web necesiat el nombre de dominio, añadimos en /etc/hosts
La pagina web nombra un puerto 1277 y minecraft

## Reconocimiento de servicios

````
nmap -sCV -p80,1277,25565 crafty.htb
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240511185718.png)

# Fase de ataque

Este Java de Minecraft es vulnerable a Log4j
https://github.com/kozmer/log4j-shell-poc
