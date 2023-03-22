import re
wf = open('wordle-answers-alphabetical.txt','r')
words = [w.strip() for w in open('wordle-answers-alphabetical.txt','r')]
for w in words:
    if re.search('b[cfglnoqtuvwyz]{4}',w) is not None:
        print(w)