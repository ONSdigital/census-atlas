#!/usr/bin/env python

import json
import pathlib
import re
import sys

from csv import DictReader
from typing import Iterator


TAXONOMIC_ORDER = [
    "topic",
    "table",
    "category",
    "sub-category",
]
NESTED_KEYS = {
    "topic": "tables",
    "table": "categories",
    "category": "sub-categories",
    "sub-category": None
}
DESC_PLACEHOLDER = "Lorem ipsum dolor sit amet."


def slugify(name: str) -> str:
    return "-".join(re.sub(r"[^a-zA-Z0-9]", " ", name.lower()).split())


def is_nested(row, rows: list[dict], i: int) -> bool:
    if i >= len(rows):
        return False
    return TAXONOMIC_ORDER.index(rows[i]["taxonomy"]) > TAXONOMIC_ORDER.index(row["taxonomy"])


def is_total_category(content: dict) -> bool:
    return content["code"].endswith("0001")


def process_census_content(rows: list[dict], i: int) -> (dict, int):
    # extract current row
    row = rows[i]

    # init content dict
    content = {
        "code": row["code"],
        "name": row["name"],
        "desc": DESC_PLACEHOLDER if row["desc"] == "" else row["desc"],
        "slug": slugify(row["name"]),
        "display_taxonomy": row["display taxonomy"]
    }

    # append units if present
    if row["units"] != "":
        content["units"] = row["units"]
    
    # deal with nested content using lookahead
    i+=1
    nested_key = NESTED_KEYS[row["taxonomy"]]
    while is_nested(row, rows, i):
        if nested_key not in content:
            content[nested_key] = []
        next_content, i = process_census_content(rows, i)
        if is_total_category(next_content):
            content["total"] = next_content
        else:
            content[nested_key].append(next_content)

    return content, i


def main(fp: pathlib.PurePath):
    with open(fp) as f:
        # filter code-less rows out here:
        rows = []
        for row in DictReader(f):
            if row["code"] == "":
                print(f"Ignoring {row['taxonomy']} with no code: {row['name']}")
                continue
            rows.append(row)
        output = {
            "meta": {
                "source": fp.name,
            },
            "content": []
        }
        i = 0
        while i < len(rows):
            content, i = process_census_content(rows, i)
            output["content"].append(content)
      
    with open(fp.with_suffix(".content.json"), 'w') as f:
       json.dump(output, f, indent=2)


if __name__=="__main__":
    fp = pathlib.PurePath(sys.argv[1])
    main(fp)