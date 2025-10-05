# Herzlich willkommen zur Sudoku-Trainer-App

## Der Trainer

Viele im Internet auffindbare Sudoku-Apps sind reine Sudoku-Solver. Sie lösen ein gegebenes Sudoku-Puzzle. Die vorliegende Sudoku-App ist primär ein Sudoku-Trainer und erst sekundär ein Sudoku-Solver. Sie wendet sich an Gelegenheitsspieler. Also Spieler und Spielerinnen, die beispielsweise ein Puzzle aus einer Zeitschrift lösen wollen, dabei aber steckenbleiben, weil sie die nächste setzbare Nummer nicht finden. Der vorliegende Sudoku-Trainer zeigt Schritt für Schritt, wie man das Puzzle lösen kann. Er liefert also nicht nur die Lösung sondern auch den Weg zur Lösung.

Es gibt aber auch weitere Sudoku-Trainer. Großartige Seiten für Sudoku-Interessierte sind die Seiten von [Andrew Stuart](https://www.sudokuwiki.org/Main_Page) und von [Jan Feldmann](https://sudoku.coach/). Ihre Trainer-Apps vermitteln dem Spieler die Anwendung logischer Schlussregeln für die Lösung von Puzzles. Die Herausforderung besteht darin völlig ohne Backtracking, allein durch Anwendung der Schlussregeln, das gegebene Puzzle zu lösen. Diese Trainer-Apps wenden sich daher eher an Sudoku-Freaks.


|         |Dieser Trainer  |Andere Trainer|Andere Sudoku-Solver |
|---------|----------------|---------------------|--------------|
|Adressat |Gelegenheits-spieler| Freaks |Gelegenheits-spieler         |
|Ziele |(1) Training der Lösung einfacher Puzzles durch Beobachtung der Lösungsschritte des Trainers. (2) Vermittlung eines Überblicks über den Raum der Puzzles. | Anwendung und Weiterentwicklung logischer Schlussregeln für die Lösung von Puzzles. Verzicht auf Backtracking.| Beschaffung der Lösung eines gegebenen Puzzles| 
|Anwendungs-bereich   |Alle Puzzles: (1) Unlösbare Puzzles, (2) Puzzles mit eindeutiger Lösung. (3) Puzzles mit mehreren Lösungen        |  Nur Puzzles mit eindeutiger Lösung       | Alle Puzzles|


|Analyse der Unlösbarkeit         | Für unlösbare Puzzles leitet der Trainer mittels beobachtbarer Lösungsschritte widerspruchsvolle Zellen oder Gruppen her. |  Keine Analyse oder nicht  beobachtbare Analyse im Hintergrund       |
|Lösung für eindeutige Puzzles| Beobachtbare Schritte zur Lösung. Unterschiedliche Schrittarten für unterschiedliche Schwierigkeitsgrade der Puzzles | Nicht beobachtbarer Backtrack-Algorithmus|

## Puzzles generieren
Die App besitzt einen Puzzle-Generator. Der **Sudoku-Generator** generiert faire Puzzles mit den Schwierigkeitsgraden 'Sehr leicht', 'Leicht', 'Mittel' und 'Schwer'. Im Gegensatz zu 'Sehr schweren' oder 'Extrem schweren' Puzzles können faire Puzzles allein durch logisches Schließen gelöst werden. Sie benötigen kein "Backtracking", kein Raten und Probieren.

## Puzzles speichern
Der Trainer kann der Spielstand von Sudoku-Puzzles speichern. Die Datenbank wird im lokalen Speicher des Browsers(!) abgelegt. D.h. installierte Web Apps sind einem Browser fest zugeordnet.

### Sudoku Theorie sichtbar machen
Anders als viele andere Sudoku-Solver will dieser Trainer nicht nur Puzzles lösen sondern er will auch Eigenschaften und Struktur der klassischen Sudokus sichtbar machen. 

Der Solver im Trainer löst daher auch mehrdeutige Puzzles; er zählt die Lösungen auf. Für unlösbare Puzzles berechnet er, indem er sie zu lösen versucht, elementare Widersprüche. Beispielsweise eine nicht gesetzte Zelle, die überhaupt keine Kandidaten hat.

## Sudoku Trainer Installation

Technisch gesehen ist der [Sudoku-Trainer](https://hubertbertling.github.io/sudokuSolver/) eine progressive Web-App (PWA). Als solche besitzt er eine URL. Für die Installation benötigt man lediglich diese URL. Moderne Browser erkennen an der Manifest-Datei im Startverzeichnis, dass es sich um eine installierbare PWA handelt. In der URL-Zeile zeigen sie die Möglichkeit der Installation an durch einen Installations-Button oder Ähnliches.  

Die Installation ist sehr einfach: einfach den Dialogen folgen. Betriebssystemseitig verhält sich die App wie eine native App. Sie kann daher wie eine native App auch wieder deinstalliert werden.

Viel Spaß mit der App und neue Einsichten über das Wesen klassischer 9x9-Sudokus.

Hubert Bertling  
