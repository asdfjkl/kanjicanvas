import xml.etree.ElementTree as ET  
import os
import math
import ast

def normalizeLinear(kanji):
    normalizedPattern = []
    newHeight = 256
    newWidth = 256
    xMin = 256
    xMax = 0
    yMin = 256
    yMax = 0
    for i in range(0, len(kanji)):
        stroke_i = kanji[i]
        for j in range(0, len(stroke_i)):
            x = stroke_i[j][0]
            y = stroke_i[j][1]
            if(x < xMin):
                xMin = x
            if(x > xMax):
                xMax = x
            if(y < yMin):
                yMin = y
            if(y > yMax):
                yMax = y
    oldHeight = abs(yMax - yMin)
    oldWidth = abs(xMax - xMin)
    if(oldHeight > oldWidth):
        oldWidth = oldHeight
    else:
        oldHeight = oldWidth

    for i in range(0, len(kanji)):
        stroke_i = kanji[i]
        normalized_stroke_i = []
        for j in range(0, len(stroke_i)):
            x = stroke_i[j][0]
            y = stroke_i[j][1]
            xNorm = (x - xMin) * (float(newWidth) / oldWidth)
            yNorm = (y - yMin) * (float(newHeight) / oldHeight)
            normalized_stroke_i.append([xNorm, yNorm])
        normalizedPattern.append(normalized_stroke_i)
    return normalizedPattern

def euclid(x1y1, x2y2):
    a = x1y1[0] - x2y2[0]
    b = x1y1[1] - x2y2[1]
    c = math.sqrt( a*a + b*b )
    return c

def extractFeatures(kanji, interval):
    extractedPattern = []
    nrStrokes = len(kanji)
    for i in range(0, nrStrokes):
        stroke_i = kanji[i]
        extractedStroke_i = []
        dist = 0.0
        j = 0
        while(j<len(stroke_i)):
            if(j==0):
                x1y1 = stroke_i[0]
                extractedStroke_i.append(x1y1)
            if(j>0):
                x1y1 = stroke_i[j-1]
                x2y2 = stroke_i[j]
                dist += euclid(x1y1, x2y2)
            if(dist>=interval and y>1):
                dist = dist - interval
                x1y1 = stroke_i[j]
                extractedStroke_i.append(x1y1)
            j += 1
        if(len(extractedStroke_i) == 1):
            x1y1 = stroke_i[len(stroke_i) - 1]
            extractedStroke_i.append(x1y1)
        else:
            if(dist > 0.75*interval):
                x1y1 = stroke_i[len(stroke_i) - 1]
                extractedStroke_i.append(x1y1)
        extractedPattern.append(extractedStroke_i)
    return extractedPattern

kanjis = [ ]

filenames = (os.listdir("/home/user/code/convert/xmls"))
for filename in filenames:
    if(filename.endswith(".xml")):
        tree = ET.parse("/home/user/code/convert/xmls/"+filename)
        root = tree.getroot()
        strokes = []
        char = ""
        for elem in root:
            char_el = elem.text.encode("utf-8")
            #print(len(elem.text))
            #s = r"\u"+elem.text #063a\u064a\u0646\u064a\u0627"
            #print(ast.literal_eval("u'{}'".format(s)))
            #chr_uni = "\u"+elem.text
            #print(chr_uni)
            #print(len(char_el))
            if(len(char_el) == 4):
                #print("char el:|"+str(char_el)+"|")
                s = r"\u"+elem.text 
                char = ast.literal_eval("u'{}'".format(s))
            stroke = []
            for subelem in elem:
                x = int(subelem.attrib["x"])
                y = int(subelem.attrib["y"])
                stroke.append([x,y])
            if(len(stroke) > 0):
                strokes.append(stroke)
        kanjis.append([char, len(strokes), strokes])


for (utf, l, pattern) in kanjis:
    #print(pattern)
    norm_i = normalizeLinear(pattern)
    ex_i = extractFeatures(norm_i, 20.)
    print(str([ utf, l, ex_i])+", ")
#print(kanjis)                



"""
tree = ET.parse('4e3c.xml')  
root = tree.getroot()

# all item attributes
print('\nAll attributes:')  
for elem in root:  
    print(elem.text.encode("utf-8"))
    print("elem")
    for subelem in elem:
        #print(subelem)
        print(subelem.attrib["x"])
"""        
