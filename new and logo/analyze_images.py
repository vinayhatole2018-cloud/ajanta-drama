import os
from PIL import Image, ImageChops, ImageStat

def analyze_image(path):
    img = Image.open(path)
    stat = ImageStat.Stat(img)
    # Convert to grayscale to check edge/contrast
    gray = img.convert("L")
    # Simple edge check: shift image and find difference
    shift = ImageChops.difference(gray, ImageChops.offset(gray, 2, 2))
    edge_stat = ImageStat.Stat(shift)
    edge_mean = edge_stat.mean[0]
    
    # Check color variance
    stddev = stat.stddev
    mean = stat.mean
    
    # Calculate a simple "photo score": higher stddev and higher edge variance usually means a real photo
    # Newspaper headers tend to have high contrast but large flat areas (white/black), resulting in high stddev but specific edge patterns.
    # Actually, let's print these stats.
    return {
        "size": img.size,
        "mean": mean,
        "stddev": stddev,
        "edge_mean": edge_mean,
    }

def main():
    img_dir = r"c:\Users\Sarhan Bakarman\Desktop\ajanta school of drama\new and logo\extracted_images"
    for f in sorted(os.listdir(img_dir)):
        if f.lower().endswith(('.jpeg', '.jpg', '.png')):
            p = os.path.join(img_dir, f)
            stats = analyze_image(p)
            print(f"File: {f}")
            print(f"  Size: {stats['size']}")
            print(f"  Color Mean: {['{:.1f}'.format(x) for x in stats['mean']]}")
            print(f"  Color StdDev: {['{:.1f}'.format(x) for x in stats['stddev']]}")
            print(f"  Edge Mean: {stats['edge_mean']:.2f}")

if __name__ == "__main__":
    main()
