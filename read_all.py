import xml.etree.ElementTree as ET  
import os
import math
import ast

test4 = [[[78, 87], [80, 87], [81, 87], [82, 87], [83, 87], [85, 87], [86, 87], [87, 87], [88, 87], [89, 87], [90, 87], [91, 87], [92, 87], [93, 87], [94, 87], [95, 87], [96, 87], [97, 87], [99, 87], [100, 87], [102, 87], [103, 87], [104, 87], [105, 87], [106, 87], [107, 87], [108, 87], [109, 87], [110, 87], [111, 87], [112, 87], [114, 87], [116, 87], [117, 87], [118, 87], [119, 87], [120, 87], [121, 87], [122, 87], [123, 87], [125, 87], [126, 87], [127, 87], [128, 87], [130, 87], [131, 87], [132, 87], [134, 87], [135, 87], [137, 87], [139, 87], [140, 87], [142, 87], [144, 87], [145, 87], [146, 87], [147, 87], [148, 87], [149, 87], [151, 87], [152, 87], [153, 86], [154, 86], [155, 86], [156, 85], [157, 85], [158, 85], [159, 85], [160, 85], [161, 85], [162, 85], [163, 85], [164, 84], [165, 84], [166, 84], [167, 84], [168, 84], [169, 84], [170, 84], [172, 84], [173, 84], [175, 83], [176, 83], [177, 83], [178, 83], [179, 83], [180, 83], [182, 83], [183, 82], [184, 82], [185, 82], [186, 82]], [[68, 135], [69, 135], [71, 134], [72, 134], [73, 134], [74, 134], [76, 134], [77, 134], [78, 134], [80, 134], [82, 134], [83, 134], [84, 134], [85, 134], [87, 133], [88, 133], [90, 133], [92, 133], [93, 133], [95, 133], [97, 133], [99, 133], [101, 133], [102, 133], [103, 133], [106, 133], [107, 133], [108, 133], [109, 133], [110, 133], [111, 133], [112, 133], [113, 133], [114, 133], [115, 133], [117, 133], [118, 133], [119, 133], [120, 133], [121, 133], [123, 133], [124, 133], [125, 133], [126, 133], [127, 133], [128, 133], [130, 133], [132, 133], [132, 132], [133, 132], [135, 132], [136, 132], [137, 132], [138, 132], [139, 132], [140, 132], [142, 132], [144, 132], [146, 132], [147, 132], [148, 132], [149, 132], [150, 132], [151, 132], [152, 132], [153, 132], [154, 132], [156, 132], [157, 132], [158, 132], [159, 132], [160, 132], [161, 132], [163, 131], [164, 131], [166, 131], [167, 131], [168, 131], [170, 131], [171, 131], [172, 131], [173, 131], [175, 131], [176, 131], [176, 130], [177, 130], [178, 130], [180, 130], [181, 130], [182, 130], [184, 130], [185, 130], [186, 130], [187, 130], [188, 130], [189, 130], [190, 130], [192, 130], [193, 130], [195, 130], [196, 130], [197, 130], [198, 130], [199, 130], [200, 130], [201, 130], [202, 130], [203, 130]], [[109, 55], [109, 56], [109, 57], [109, 59], [109, 61], [109, 62], [109, 63], [109, 64], [109, 65], [109, 66], [109, 67], [109, 68], [109, 70], [109, 71], [109, 73], [109, 74], [109, 75], [109, 76], [109, 77], [109, 79], [109, 80], [109, 81], [109, 82], [109, 83], [109, 84], [109, 85], [109, 87], [109, 89], [109, 90], [109, 92], [109, 93], [109, 94], [109, 97], [110, 97], [110, 98], [110, 99], [110, 100], [110, 101], [110, 103], [110, 104], [110, 105], [110, 106], [110, 108], [110, 109], [111, 111], [111, 113], [111, 114], [111, 115], [111, 116], [111, 117], [111, 119], [111, 120], [111, 121], [111, 122], [111, 123], [111, 125], [111, 127], [111, 128], [111, 130], [111, 131], [111, 132], [110, 133], [110, 134], [110, 135], [110, 136], [109, 137], [109, 138], [109, 139], [109, 140], [109, 141], [108, 142], [108, 143], [107, 144], [107, 146], [106, 148], [106, 149], [105, 150], [104, 151], [104, 153], [103, 154], [103, 155], [102, 157], [101, 159], [100, 160], [100, 161], [99, 163], [98, 164], [98, 165], [98, 167], [97, 167], [96, 169], [96, 170], [96, 171], [95, 172], [95, 173], [94, 174], [94, 175], [93, 176], [93, 178], [92, 178], [92, 179], [91, 181], [90, 182], [89, 183], [89, 184], [89, 185], [88, 186], [87, 187], [87, 189], [86, 189], [85, 190], [85, 191], [84, 192], [83, 192]], [[160, 45], [160, 46], [159, 47], [159, 48], [159, 49], [159, 50], [159, 51], [159, 53], [159, 54], [159, 55], [159, 58], [159, 59], [159, 60], [159, 62], [159, 64], [159, 65], [159, 66], [159, 68], [159, 69], [159, 70], [159, 72], [159, 73], [159, 74], [159, 75], [158, 77], [158, 78], [158, 80], [158, 82], [157, 82], [157, 83], [157, 84], [157, 85], [157, 86], [157, 87], [157, 88], [157, 89], [156, 90], [156, 91], [156, 92], [156, 93], [156, 95], [156, 96], [156, 97], [156, 99], [156, 101], [156, 102], [156, 103], [156, 105], [156, 106], [156, 107], [156, 110], [156, 111], [156, 112], [156, 114], [156, 116], [156, 117], [156, 118], [156, 120], [157, 122], [157, 123], [157, 124], [157, 125], [157, 127], [158, 128], [158, 129], [158, 131], [159, 132], [159, 134], [159, 135], [159, 136], [159, 137], [159, 139], [159, 140], [159, 141], [159, 143], [159, 144], [159, 145], [159, 147], [159, 149], [159, 150], [159, 152], [159, 153], [159, 154], [159, 155], [159, 156], [159, 157], [159, 159], [159, 160], [159, 162], [159, 163], [159, 164], [159, 166], [159, 167], [159, 168], [158, 169], [158, 171], [158, 172], [158, 174], [158, 175], [158, 176], [158, 177], [157, 179], [157, 180], [157, 181], [157, 182], [157, 183], [156, 184], [156, 186], [156, 187], [156, 188], [156, 189], [156, 191], [156, 192], [156, 193], [156, 194], [156, 195], [156, 196], [156, 197]], [[129, 100], [129, 101], [130, 101], [131, 102], [132, 104], [133, 104], [133, 105], [134, 105], [134, 106], [135, 107], [136, 108], [136, 109], [138, 111], [139, 113], [140, 113], [140, 114], [141, 114], [141, 115], [141, 116], [142, 116], [143, 117]]]


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

def m10(pattern):
    sum_ = 0.
    for i in range(0, len(pattern)):
        stroke_i = pattern[i]
        for j in range(0, len(stroke_i)):
            sum_ += stroke_i[j][0]
    return sum_

def m01(pattern):
    sum_ = 0.
    for i in range(0, len(pattern)):
        stroke_i = pattern[i]
        for j in range(0, len(stroke_i)):
            sum_ += stroke_i[j][1]
    return sum_

def m00(pattern):
    sum_ = 0.
    for i in range(0,len(pattern)):
        stroke_i = pattern[i]
        sum_ += len(stroke_i)
    return sum_

def mu20(pattern, xc):
    sum_ = 0.
    for i in range(0, len(pattern)):
        stroke_i = pattern[i]
        for j in range(0, len(stroke_i)):
            diff = stroke_i[j][0] - xc
            sum_ += diff * diff
    return sum_

def mu02(pattern, yc):
    sum_ = 0.
    for i in range(0, len(pattern)):
        stroke_i = pattern[i]
        for j in range(0, len(stroke_i)):
            diff = stroke_i[j][1] - yc
            sum_ += diff * diff
    return sum_

def aran(width, height):
    r1 = 0.
    if(height > width):
        r1 = width / height
    else:
        r1 = height / width
    a = math.pi / 2.
    b = a * r1
    b1 = math.sin(b)
    c = math.sqrt(b1)
    d = c
    r2 = math.sqrt(math.sin((math.pi / 2.) * r1))
    return r2

def chopOverbounds(pattern):
    chopped = []
    for i in range(0, len(pattern)):
        stroke_i = pattern[i]
        c_stroke_i = []
        for j in range(0, len(stroke_i)):
            x = stroke_i[j][0]
            y = stroke_i[j][1]
            if x < 0:
                x = 0
            if x >= 256:
                x = 255
            if y < 0:
                y = 0
            if y >= 256:
                y = 255
            c_stroke_i.append([x,y])
        chopped.append(c_stroke_i)
    return chopped

def momentNormalize(kanji):
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

    r2 = aran(oldWidth, oldHeight)
    aranWidth = newWidth
    aranHeight = newHeight

    if oldHeight > oldWidth:
        aranWidth = r2 * newWidth
    else:
        aranHeight = r2 * newHeight

    xOffset = (newWidth - aranWidth) / 2.
    yOffset = (newHeight - aranHeight) / 2.

    m00_ = m00(kanji)
    m01_ = m01(kanji)
    m10_ = m10(kanji)

    xc_ = (m10_ / m00_)
    yc_ = (m01_ / m00_)

    xc_half = aranWidth / 2.
    yc_half = aranHeight / 2.

    mu20_ = mu20(kanji, xc_)
    mu02_ = mu02(kanji, yc_)

    alpha = aranWidth / (4 * math.sqrt(mu20_/m00_))
    beta  = aranHeight / (4 * math.sqrt(mu02_/m00_))

    for i in range(0, len(kanji)):
        si = kanji[i]
        nsi = []
        for j in range(0, len(si)):
            newX = (alpha * (si[j][0] - xc_)) + xc_half
            newY = (alpha * (si[j][1] - yc_)) + yc_half
            nsi.append([newX, newY])
        normalizedPattern.append(nsi)
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

""" test case moment


"""
#mn = momentNormalize(test4)
#print(mn)

kanjis = []

filenames = (os.listdir("/home/user/code/convert/xmls"))
for filename in filenames:
    if(filename.endswith(".xml")):
        #print(filename)
        tree = ET.parse("/home/user/code/convert/xmls/"+filename)
        root = tree.getroot()
        strokes = []
        char = ""
        first = True
        for elem in root:
            char_el = ""
            #char_el = elem.text.encode("utf-8")
            if first:
                char_el = str(filename[0:4]) #.encode("utf-8")
                #print(char_el)
                first = False
            #print(len(elem.text))
            #s = r"\u"+elem.text #063a\u064a\u0646\u064a\u0627"
            #print(ast.literal_eval("u'{}'".format(s)))
            #chr_uni = "\u"+elem.text
            #print(chr_uni)
            #print(len(char_el))
            if(len(char_el) == 4 and not "\\" in char_el):
                #print("char el:|"+str(char_el)+"|")
                #s = r"\u"+elem.text
                s = r"\u"+char_el
                #s = char_el
                char = ast.literal_eval("u'{}'".format(s))
                #print(char)
            stroke = []
            for subelem in elem:
                x = int(subelem.attrib["x"])
                y = int(subelem.attrib["y"])
                stroke.append([x,y])
            if(len(stroke) > 0):
                strokes.append(stroke)
        #print(char)
        kanjis.append([char, len(strokes), strokes])


for (utf, l, pattern) in kanjis:
    #print(pattern)
    norm_i = momentNormalize(pattern)
    ex_i = extractFeatures(norm_i, 20.)
    print('["', end = '')
    print(utf, end = '')
    print('",'+str(l)+","+str(ex_i)+"],")
    #print(
    #print(ast.literal_eval("u'{}'".format(utf)))
    #print(str([ utf, l, ex_i])+", ")
#print(kanjis)




"""
TEST CASES

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

