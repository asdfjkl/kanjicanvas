import xml.etree.ElementTree as ET  
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
