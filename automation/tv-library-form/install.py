from pathlib import Path
import base64,zlib,datetime,json,os,re,shutil,sqlite3,ssl,subprocess,sys,time,urllib.request
MARK='FSJ_TV_LIBRARY_FORM_V1'
PAYLOAD=json.loads(zlib.decompress(base64.b64decode('eNrFXG1zG0dy/itDOfHuWosFqBfnAnDJomToxAspskhItkIyrAF2QKy02IH3BSQNsep+RCqf40pVru7Dfbqq5Hv4T+6XpLtnZl+ABSnb5zvLRe7OS09Pd8/TPT2zXDzK5hdROEx4cnMxlsnUm9086rJHZ/RvIKacyWESXvLs7s9JKJlglyLN7v5LsoCzYTiMQpmJEWczEXGWijTFqg93P7I5j8KAQ6NAst00DdNMxJlgr05+5ynaZ3E4nckkYx9SGbtMpi5LhAs0RonI4CULp+IsHidyyvIkAha9GU9SwXQvKKN3l9Gvi+/Ts3jwun/QP/Ft6yWHRpZr7c7Dux+BbXjch37iBw5PB3c/fp+HMU/h+UQk0OQPEp8P8yyBB+csDsSYxSALmMIPwoaZ5MLpnsWMnvw0S1QZkwmzLMeDgnBmQz8GHTgIwV/AyCK1ulUGdmG+PFwunIccn2qFRxGPMyo089hLUAV3fwDhVkoPuJ5HtzanAx7nIGzTujpFeh7JtFZ8C4yDyPNET5CFY/MQMyVSJiKQvJ6ddykyJYBlmWUTMa3KqyAUy6wk1k1ADIK9w5p+ksjEtvrpSEYTzvIpy9DkYP4iZYFgIwmSiHOeeDhGjU015I3Ms3xYHZTMIfCNfdjr1OUoBlVzLx0h7xu+NcmyWWphW12TpyKJ+VRUimY8Ta9kEjTMZC/GRSRwJlEYf2SvB4OjE1wD72U+AEbVPCYyzXxbU8MXMwDyF8krkdiaPWrpWzRNbyisbhjAOvILRrKJno/VJsoi0p1Q3ralxeON5BTUf3V15dVLprV3kh+rjACrynD5fS6SG4d0b80t99Syzp3TznlFhMgMsNq+4tloYimTqfE5i8KM+Dx9Qv0S4Y3zKJpieyi3xXQogk/pBJZ36rRP/619/ri9Y7kVGo6ialk001RoadB7OCYzqxFNrFPe+mG39a+d1j9ftM4Xm5u3lkt9nAbd7aPCwOjmd38KhKwoDWQ5v/sR8EzWzJAIKTMM4zTjUWTHKcnwtR+np9ZrHgeRSKzzXjCkgmAIz9/sDnbpDR/g/fjwcEDv+ADvPA/CjAroyToHejIKLsJYF+MDlaqBQaZKb6YRmQ67CrMJC4a2w3jKRtSAjTxxLUYADoCQx/3dQZ8Ndl/s99neK/bmcMD63+2dDE6Y8QZTkQF+Z9yew0TlRRiwQf+7ATs63jvYPX7P/qX/3qUFr4qRwJu3+/vsm/6r3bf7A3Z2ZsH/biDSEdgn4Fl8b0OHJPu5PFacVirzZCTSe7jUJm7qXHAwPBPBxfCmzpFioRSxj7+MnFHXYXZjpyIaK3nnPj4TPiiRawvMcSHnaqUkMhKWY/DPtuRVDAbhWvNQwCKHmrLpCOznQsbRzWppImlxarN7I2OBw+nXXHMYgYuFllcpsejmiskmM8BG/mkQjjI7cRjgFUuQu4rkT/r7/ZcDNve+cqceKRl+VzTppl4pVHipSPTV8eEBI12kbM72+68G7HeHe29WrIpN2eEbNvWM2vy5B/op269qmKXYI13qcXj8Tf+YvXgPzGouwLBOXlrOuZJRmkeZf0ovNFN5hXNFEShhaKWRKkHWgL2BnbtQ73S18xGqHTgmf/GxOycyH925JuNhRQryBUIfS0WXEgFta7qgWEAEkEqYUkNU5G1B/NQiQYPZlaEH0C+KnZ5qNeLxhQBguDDN81NlZucAvsq+mJroaZULqIWGYQAIo4Ti8dlMxIGNVJ2KPalaDTpgg/5rL5AXv+0PtJ2hWZaLgEC/9LUoRQJq+okNwFVCOAcRUTubt7RGWxRofoAwxLYaSl0rE9dZ+wOfc2VxPTaaIP3Mz7Nx6zeW465SG6WN5LBY04PHFUK3et0it6g4xa2yDPTJ7hSiUF+VnmIjMiSWJTfgP658GzG7bQH2Z+HIamMPxwOZo8QhglGwwMT1SMwydnhCfsYsY5JVImbRjf2s80y1pLIUtHIBWpjJGET6pNNxelQ+AboiSS/AU09lbOtSaq2qADHBYgGnWoObmbCI9/ta7Yv4MptYLkZIkYhtmJHj6A5l+9SMdDUOI+FdJWAw1LSnJlKRIIRPbT4LK7qxzGy1MSnLUehZh9QqgDaKaNNdWAIFCMFrP84SgXsOCW1yxgEdUsl4nskk/IEHsmHTYd1WjbxCWQ4/gHUqxLK6KyjqqvUHVSp6JTJmSfgwJb1SZhiovfYuoOLo8MQsFiz9KatFS0DHdRwCIQRwe1ms7dIbmLFLKYIMLsPYr9qM8iWHVGEZUa82+K4FkmodC4j10sxyQJ2bhCW2IknoVXCvyhwvFlkkRxsN472WSMVp1ObTijaRLzEtgixudPV3MhFc3MY1mJh2Sfz5LJI8sFQz9n0ZLDfpVkXOvUzOwpGvtkjfKwEpBC9iaUB4CCN9XYnPYZaju+URNuqoVj5qRQ0cqsBT6cV4gQ3jBR6U+4mc0twlO0rkLAlFRjtQNNwwxmLNwohYMOIBAYVZJAyb9ILsvdNRczUtoDg2O64egemqndRRi7ZoaqvQs7B7LwVXCLGYMvHmrgbKQEiOUwgHLYX4QyNGhKMXZ3vz6w6WIDulxyYEaE9nzyg8w+crMZyqYAwbdbaQjy0KwQ92v7POG3YQJyISKC3a/+ltxMHRMyZz9q0YHuDmgmd3f2TPOx128MKzDKu0i9GZDy+TH0UM4Httb34NZiOmMx+3Cm2DUW2b2j+2MCECC6wHOIF+ut6I2vTQV4QZhAD+Kw77Ja0/Y+A6PMQhPAnBgG1dDy2KFMemAYhtDKzBzE3B1QTcABUXbcCr5vFHpdmEvAT6QHsaxja2czc7T559hT+Mbkr1UM+mjEA8D9EAMzTW6azYeqn/xtoNUW+nh4O0fFSwKjDtxt44ytMJWJ5MvXF6E49sKAL+YmkXrCyLIClEMOWXsGLHajJPn5gOmnPbJnP2K4ZDC5F6nT7r/gZW6tAaZzczZUP15mRblfbdZ9T87Ox6k/fhZzCGH/wpweeKcF5hgJjJyl51aYNKOsmTBM1qFUMr0ldtHgTTXYWe4noWJoSdecIVcgjUk8cU2sZyzglSSqyoYZQe7m+HVEqvSBHw31brpKb3pZ1RyW+3sht6e/QN7kP1puakP2A1bPY77NvX/eP+Uulmaa8VWntvTvrHA7b3ZnCoCcJqdgmXKF5zcam5NUqu3j6YfavD3u3uv+2f2Dtu5Z9juQoXGohlNhKEUOYry8W0qoc/YAU8xODaTIDa+Ff39nWmKsyg10NMf2ise3b0lQ17dZhyEL2xKcegzIk9MhUq5eNWNwfagxeLpcDJQaI3fAxMCyRfQCWZUh5jVg+WMkQO8eWF/Ejtl1eVIdZVFnd/r1Xbf0JrT36EkDPBJCtMQSW6tFmjKhTYDmVwozcZ64MVvVM30Uo1DkFK1VAEov+bzDc51bIWwhqso/CkLK1HKA5ua0vp/V1jE9zRVOZGIQqBcBGlFLm9Wv7+wbChAYwHd3/K8qgJgu9x66pBMwT9Cgj09wAgtek2xud2PgOH/oYw9DNQqJLxagak6oA3q6j0MCgZYf1sZNAWV7P+MNCmr8k2Gh3seP3m/N9nJfc+N1mnrBQf/Z1CVI7jjUU2mkDYvLQIMVmno++m/FxjIqWCIe9MbBSEmEy5+9NcVJBiPWAqLCxw/168LNfsKsgR9q3k4TZMHu5BDNxlPIL4V537IWTR2diID2EXobeyWEohGG4x+BJYVuKgv/rKQu2+PHzzan/v5aDo5bBvDpnGKgQpIuKL61GUByLw9HZ33ZJ8eH1ooav2dNK1RoN1z9S9T0m/Xuz5q+D32aOHaG0auPYBZg1dWG9nj8oF99kSX3LxRvKpeHDx7SqrXUnqrM3AGVRTzXTO1C49rYvpAXoi5GrmoFNygCgoHJ2uM2k5H1NlZ/Ejlz1SSduGrDRef2h/hRmhi8G7i/29F8e7x+8vXh0eH1y822Rftc9i23b87QUQtnIIBjB8GGVWD95HEkMe3IyDxLcDOcrRdhAx+pHAxxc3ewFowVHWn/qnv+iqwnk5Jp0TqxMjlRKxIFwb2xtY/ukTVYzTDwNcQPs6Nes4SoIlkRFPAr/gWoGWZty2II5BMwC62AwhfIWiqhlFPE3fwEbQt/BdCYa6xLDgXg8O9n1rKwjnaJVnj5Zo4Nb27NH21mRze/AOdcBa7EV5zQR2vArV0602NNmKAAyjbbymspVi7iUriGp6A5Tz2SOwOhBkIoLtLanOItVdDryIsl1mbRTE/uX3/73VVs22t9qKLjyosfSQmosClVNNA3bHy5wQC+9wueLEVoc3lx80JYCYqQgTeQ8LwzzLZFwf4Fs88IaJZrBKoFg1Aep/+Y//0XnOMDHZgiqzbdVyeysAHxBGaZ1qHwACiE7CAKBheyvNp1MQ6jYW80TxCxJoImuaanm9kXM1v2XpICmtpM+c6Qmfi4aJnvBornkqJ9XWswKDerK9G4TEXsLu/rOSpARLelJXK86Jz3gioolk//e/1RTeVhjP8iXdvgqjCkNj9cZHCGDwXqSH3DLzQ3Ot2ZO6e1DsSpqGea+iw3Ik2JXBC+U2JjIKRAJldH2l224vXfVQlzJ25j7YdnXwJvnuBkGDeEvh8QaTLwQ+q9M6EGnKL5FndLtQgaibpyifJOSAvHMsnMkozATxNUOdhfNtQg2CrVkiPxjo8fgYAiIb0cQpYavu/9bhF1C11Ba2aGtAbK9aiAYJ/gPJLzWuwBdgD2YoeVIm4CpBQBWb9OFGsUqW7b829gkFzw0woV0U1Lyo2K0BiKXGygIbbHltjxtjWit2+BAONkFvbUq/EgBTEqQFg7XUhqMmo6ajiHuZfDmRYaPcfxY8r2NQI4MG090EBDKX94BLjcW/Asg0sFQo3nB1Pw7VOHpL8POrYVF9YYisAZO+wRAc3FrMQTcRx8tQo5DjPJkKHppwqUb3Z+BTiUw1eHirE4rFtYpqJYEVhJe2BqyAyTE7tZbCFAjsqg5Rva4uJuvcKUlRHInUVEDpIGMQX3o8COxYXLFDMlJbbbbop0PMRCJjVzL5GMaX/hiPhtxLAfDGsbXfIXbzmFCXwc5cpoKCNCS9qAzsm+FovVDAqfgAsKRNX2rrMRem5RjgGa8UZBPc3f+U+5+9Wx3xE8nebZVHPLa31TrUs9Rs0l2nZp52NGDgiRB6lbm/PVd7VN9XXZzu6XkPdKCEmJoBTpcFu2NVEUzhPBg3nkI3gwedcrqe5yF73pTPcPAKVeCDcmiYKXGcc6c+Wbz9cwJ2KmwzS1r0fjkfsD+aDdi87xfBfxGHWlphTq9Wh5YHVQoJ/A0iuuPV7xuhjqnCMV1Le9VUfapXkqwznsDCwMtyC1JXE1+uKayti4LdWr8GBK8QaFg3BZmKAJUEtOSKNaxFkMF2tHfPUjeSokyCagiILPM4S494LKKVJigNjueQFWXGsHucFJo0p3aPH5frsaeqxHWWcJ9f8TADjx6uXApROz5NYAP1bgiYjZ6iM4Q9qI/GdgB2R0RVlq4wxFM0HHd+7qDAiXRhWrqFvQDbnaMBIzF1IRxN9dbBW0FKyTRZNeIsEfNQ5umxGCcinfiJ+t3Tv/26SEAWapJL3YCkKjci693WcOpS2inEfCJ2FlewAuSVB2bwksCLrOuEKnc804oYXGNvMh5NeHwpfNrpr19BvmVVJtyrEKy1LcgVlldt2miqzRw02vxDrDSEmMsD1CNdurFCkAaR8G4U2dbpUuhwbiGSJ30OehCRvy0iY+nwhG1TkaH41WgbJQg186LX5erqmIkEszL2VPnpvcBVDh0exqBnsHftxIyJG59GS3eYpzflIjY9HS8IUz6MRFDWFfQdD48t9LUS3zpKJB59czAnBPReltxo4xzjDbzbEV0zp4yTcnFrCFELT1f2bvXR4qLmgRW76nENv6rytgaqGAoe4DkKPjgL7SPpFgbGS58+2e2zMw8Dwn9oh8AUIChV0mXFnep1hG7lKoPThFUp7LwxDiUCOoFbj3NQIxvESM2/1+7FcBX4egqviBc8c9p+3ul8Vd4UqfXfD6cQgGFAoG7OsJk0Oy8ko1CGrJaA7e3x/ongyWhyxBM+Te0F+aKuDoLQs3YLEXhpBIvI7ribX3ec+my6tbcdaxMk1LFuzXjmiqaGZDrDsNdcFduxHhN77mIqsokMuhZmIy1XX2bqLpbu3nVhMLd+MapbV/Sti4e/VFjlCG87K34Mex5+X2WrbGBRJj/WBKxvBJOVfvpkvcHM7ViGeH0xpWMTOmSA3a6sSL12X7gGpiaNoFAG5PuRQMYsZmspO6AC3aKTS1ZHsFcNNath6CpiuyiIeqiDloowBb/S0865C1uUeoP35rhN4Y+XQXRmF0b55ZfQwVkXpmojxp2b+dQHbXLEA55miTHuDUVoY4VS04JAWuHS50O1D4cMZ45ScNNqJICAAIc+11obKZSnsrWVAVzq1WGZD1/+8vt/Z9Zjqr5diha1eAvfc59osd5YpfHltfbGEpbgV2/kuc49YSpDR9KaqceWZ/VunRXHiznCn2591GvF/CCIXh8AqIOyFeOsBMVkBxAbrdd/uaTuUZk+PFuYs7lb52dJlL7oVMeKgfTYoclf4UedP7LKQSkTUxQyDlURcj2eO1KpOV+n6Hq4qaxh5lHEb4YcFKAcF36dp7sUwZ7aTCzMtmLHqxH48ku1mSjP3mE1NQ7hLJa4suM8go23HlAEpDa1N9HQVWwol3sqnpbCyxkMVHDbOMkNtWWqz4BChtkSYeP/7xPWLcSzteRnsfWqSMMpY9N3RzLN8Jui1d0L9YKwk8yBjmf2YSPlJWIq58peW2BpE4mHqziKDp/BIe3GQSJhmDKgHrx7bz65VJOhEdKJvNqrnxUaNtRsVF7FtjCwIHQqJlMPIMrpnGR0u9WjFWxrTFMZYRAUTZRUAi0oCMMVa0YZyO/xq1MOiwMkGOTqLHIG0YDOEWE+wekVqWK0eyTSn2OqGEMI9YScdEsdtFTEHGDfFX9HBzBLmLNA5d/vuHq/cAeP6KI08RDAFGdVgtyYuqnUq5h1Qzj7AJwshbX37DpEdg8cN6XkGrJfSKSCzjhz2lbXZ17cVR1FeYpuNVi5FmGE3hxYNG3HXJ0x/YxtDGpEt/Z9q9ibrzqTe/Zyn+sz6inuBzzI0gcF4EluK4uxZHlMjn0pxmhkejnC0gF2kv+SEKTbONRbvIFoXK6KUd41nLxYSxF8RhcK1nrKptmsBDTr+MA2VVx8Dfi54yH1ZeA2sNTEsbpHAotxfRabcp8V90sfBvkrSEmGh4/G1tQXOjzyqdSsvl7tzRcIdEWssxaG6tns0ltXXJFxphVAMd8oaUYwmRhFikmXBkYnWyCpysuovINFKWxC4X36Rgc/XFPwa7mGZ2CDHj19z5bUsgEmnPH0I6rD+vQJj76gse8rVZk8geqXgtXtTaciCHkmECT4JVcpqJ7q5+F9EY1IsI2EfVjXuEscI7VuXcscc+TJkMcSOniXYTbJh14oUXF6PeAHYcbdrM4M/Qz+9Qy0F5fQrUjlVERzBAojxzcOkzR7OQmjoB7dHeImGCwqFR84G/MfRLJjIrcHBo/kJWhSj11mDh8//mVB/33p3JX+xrPp+/o0PxBD9Rzj3oS6WSVlBIMJQJUPfZuCnzCJQ6/i54qgoebL6JDk1rHxV7vNdnEl1pft3R8ZDH/3Ixq2WbI9VvubKMAhS3Nk8u7PwKha3t5ZDPyhJckxU3EbjPc2DrOUwFeHm5azVFfJjupVdbruflEt3junMPaeC0+j9DNuPH2hbxWxL6qWuBhDaetKhJeTrPtPnc6G+tssPM5uV7uodV3r8qzTwYa17Lv7RQ1r8D7QAsMzQJVuDM6vPkbD7SH3i+YT/cVQXrfS8IcwvuwOZQKLqwUlvWkYt67CIJt0Oz31e7PT+cfelF+3JopLeodAORlH8qqL1y4BHIIA6TyZXa/hgtGh5jpeVG0xr2EkAZenAGJh3H0+u2adHokJ02LdzWfrB5lsrh1hsrkoaTzpzK4N/Q7rsN/cQ/JJpd/m87LfZgcZY/dwQ2fFbmOVPjlbx2zZs6lWdV5UtPOwKhXTLcD37tOZqtLqfAqTr4r36wcmdEqnzhjjnN/Pf6VhVYRgI4W9PF8/lsr2rh1BVa+x4ardlhN99qRUnjIqwwZKAHeal4nM46D7xZOnz4NnmxAURzLpXk3CTBguK6F/V0xn2c0qg7Xq2lJtILK2e1ViT0u+v0a+q3RQHItqZa/esQY84M4F+sZERmnB2WUSBiWI9PC1hd/2RBACtEAE+TROu8/BzBnIEmAAU8PjxGFYVO3HZyRHHoWXcYv+CER3hBeFk0LMyB8ZWySuSSA9CA5CnHZXYXEvS3icIgoX8mrkHd5MhoJkuKZRDKEANtArZYnhcnUsVRhzWW3eXGOm16m21thSKUK9oFNgTwE42kiD7YITjCpN6tOvDlGX0xq/sl5Eiw85mNj4poWXg7sUb94+KLVaH4i+lnrgX3ZaYLTVIpUbZdd6qTJgEnPzng4UZzqvwx4wzGbv9k6DhNJ8wzn0NiD2ehLlPgQqM9vwRCGvs01lX5ThgqMKyk4D+vJJla7keJz14z66/X8Ab9rV')).decode())

def prepare(root):
 server=(root/'server.py').read_text(encoding='utf-8');app=(root/'static/app.js').read_text(encoding='utf-8');html=(root/'static/index.html').read_text(encoding='utf-8')
 if MARK in app:return None
 if not (root/'library_videos.py').is_file() or not (root/'fsj_sso.py').is_file() or 'FSJ_TV_POSTER_V1' not in app or 'FSJ_TV_TWO_PAGES_V1' not in app:raise ValueError('A versão esperada da TV FSJ não foi localizada. Nada alterado; envie os arquivos atuais para revisão.')
 matches=list(re.finditer(r'const descriptions=\{[^\n]+?\};',app))
 if len(matches)!=1:raise ValueError('Menu diferente do esperado. Nada alterado.')
 descriptions="const descriptions={taskHome:'Tarefas',projection:'TV FSJ',fsjThemeLibrary:'Assistir vídeos da biblioteca',callPanel:'Chamadas de vídeo',institutionalUpload:'Enviar vídeo institucional',accountsPanel:'Autorização de contas - Aprovação de novos integrantes'};"
 app=app[:matches[0].start()]+descriptions+app[matches[0].end():]
 anchor="fsjOptions(select,cards.map(x=>new Option(descriptions[x.id]||x.querySelector('h1,h2')?.textContent,x.id)));select.value=active;"
 replacement="fsjOptions(select,[new Option('Selecione uma opção…',''),...cards.filter(x=>!['projection','libraryUpload'].includes(x.id)).map(x=>new Option(descriptions[x.id]||x.querySelector('h1,h2')?.textContent,x.id))]);select.value=active==='projection'?'':active;"
 if app.count(anchor)!=1:raise ValueError('Seletor diferente do esperado. Nada alterado.')
 app=app.replace(anchor,replacement,1)
 anchor='function units(el){'
 if app.count(anchor)!=1:raise ValueError('Paginação diferente do esperado. Nada alterado.')
 app=app.replace(anchor,anchor+"if(el.id==='fsjThemeLibrary')return [document.getElementById('fsjThemeLibraryForm')];if(el.id==='institutionalUpload')return [document.getElementById('fsjInstitutionalEditor')];",1)
 anchor="$('screenSelect').onchange="
 if app.count(anchor)!=1:raise ValueError('Navegação diferente do esperado. Nada alterado.')
 app=app.replace(anchor,"window.fsjChooseVideoScreen=function(id){const card=$(id);if(!card||card.hidden)return;active=id;step=0;update();};\n "+anchor,1)
 old="$('previousPage').disabled=step===0&&!(active==='accountsPanel'&&accountStep>1);"
 if app.count(old)!=1:raise ValueError('Estado das setas diferente do esperado. Nada alterado.')
 app=app.replace(old,"$('previousPage').disabled=step===0&&active==='projection';",1)
 old="$('previousPage').onclick=()=>{"
 if app.count(old)!=1:raise ValueError('Retorno diferente do esperado. Nada alterado.')
 app=app.replace(old,old+"if(step===0&&active!=='projection'&&!(active==='accountsPanel'&&accountStep>1)){active='projection';window.fsjTVHome?.();update();return;}",1)
 app+='\n/* '+MARK+' */\n'
 anchor="if __name__=='__main__':"
 if server.count(anchor)!=1:raise ValueError('Inicialização do servidor diferente. Nada alterado.')
 hook='from tv_library_form import install as fsj_tv_library_form_install\nfsj_tv_library_form_install(globals())\n\n'
 server=server.replace(anchor,hook+anchor,1)
 html,n=re.subn(r'(<link[^>]+href=[\"\']/style\.css(?:\?[^\"\']*)?[\"\'][^>]*>)',r'\1<link rel="stylesheet" href="/tv-library-form.css?v=20261020-1">',html,count=1)
 if n!=1 or html.count('</html>')!=1:raise ValueError('Estrutura HTML diferente. Nada alterado.')
 html=html.replace('</html>','<script src="/tv-library-form.js?v=20261020-1"></script></html>')
 prepared={root/'server.py':server,root/'static/app.js':app,root/'static/index.html':html,**{root/k:v for k,v in PAYLOAD.items()}}
 version=root/'version.json'
 if version.exists():
  data=json.loads(version.read_text());data['web_version']='tv-temas-20261020-v1';prepared[version]=json.dumps(data,ensure_ascii=False)+'\n'
 for path,content in prepared.items():
  if path.suffix=='.py':compile(content,str(path),'exec')
 return prepared

def health(root):
 context=ssl.create_default_context(cafile=str(root/'dados/tls/fsj-ca.crt'))
 with urllib.request.urlopen('https://127.0.0.1:8443/api/version',context=context,timeout=8) as r:return json.load(r)
def main():
 root=Path(sys.argv[1] if len(sys.argv)>1 else '/home/urbano/fsj-video-v001').resolve()
 try:prepared=prepare(root)
 except (ValueError,OSError) as e:raise SystemExit(str(e))
 if prepared is None:print('Formulário já instalado. Atualize o principal e reabra Vídeos e Chamadas.');return
 if health(root).get('busy'):raise SystemExit('Há chamada ou envio em andamento. Encerre e execute novamente; nada alterado.')
 flag=root/'dados/updates/applying';flag.parent.mkdir(parents=True,exist_ok=True)
 try:fd=os.open(flag,os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600);os.close(fd)
 except FileExistsError:raise SystemExit('Outra atualização está em andamento. Nada alterado.')
 backup=root/'backups'/('tv-temas-'+datetime.datetime.now().strftime('%Y%m%d-%H%M%S-%f'));existed={p:p.exists() for p in prepared};written=False
 try:
  if health(root).get('busy'):raise RuntimeError('Aplicativo em uso; tente após encerrar a chamada ou envio.')
  backup.mkdir(parents=True)
  for path,exists in existed.items():
   if exists:
    dest=backup/path.relative_to(root);dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(path,dest)
  database=root/'dados/fsj.sqlite'
  if database.exists():
   with sqlite3.connect(database) as source,sqlite3.connect(backup/'fsj.sqlite') as dest:source.backup(dest)
   os.chmod(backup/'fsj.sqlite',0o600)
  written=True
  for path,content in prepared.items():
   tmp=path.with_name(path.name+'.tv-temas.tmp');tmp.write_text(content,encoding='utf-8')
   if existed[path]:shutil.copymode(path,tmp)
   else:os.chmod(tmp,0o644)
   os.replace(tmp,path)
  subprocess.run(['systemctl','--user','restart','fsj-reserva.service'],check=True)
  for _ in range(10):
   try:health(root);break
   except (OSError,ValueError):time.sleep(.5)
  else:raise RuntimeError('Servidor não respondeu após a atualização.')
 except BaseException:
  if written:
   for path,exists in existed.items():
    if exists:shutil.copy2(backup/path.relative_to(root),path)
    else:path.unlink(missing_ok=True)
   subprocess.run(['systemctl','--user','restart','fsj-reserva.service'])
   print('Falha: arquivos anteriores restaurados.')
  raise
 finally:flag.unlink(missing_ok=True)
 print('INSTALADO: TV FSJ inicial, biblioteca por tema obrigatório, upload/YouTube e edição de tema.')
 print('Menu com Tarefas, Biblioteca e Chamadas; institucional e aprovação de contas exclusivos do Proprietário.')
 print('Backup:',backup)
 print('Atualize o principal com Ctrl+F5 e reabra Vídeos e Chamadas nos celulares.')
 print('Contas, senhas, vídeos, chamadas e rotina das 7h preservados. Nenhum vídeo enviado ou alterado pelo instalador.')
if __name__=='__main__':main()
