import csv
import json
import os
import pathlib
import shutil
import tempfile

from unittest import TestCase

import content_csv_to_json


class TestContentCsvToJson(TestCase):

    def setUp(self):
        self.maxDiff = None
        self.test_dir = tempfile.TemporaryDirectory()
        self.test_fn = "test.csv"
        self.test_fp = pathlib.PurePath(self.test_dir.name, self.test_fn)

    def tearDown(self):
        shutil.rmtree(self.test_dir.name)

    def write_test_CSV(self, csvRowList):
        with open(self.test_fp, 'w') as f:
            writer = csv.writer(f)
            writer.writerows(csvRowList)

    def read_test_JSON(self):
        with open(self.test_fp.with_suffix(".content.json"), 'r') as f:
            json_contents = json.load(f)
        return json_contents


    def test_content_csv_to_json_OK_one_topic_no_subcategories(self):
        # GIVEN we have written a csv with one topic and two classifications, each with two categories and one total
        self.write_test_CSV([
            ["code","taxonomy","display taxonomy","name","desc","units"],
            ["1", "topic","topic", "Topic 1", "Topic 1 desc.", ""],
            ["1_1", "classification","category", "Class 1_1", "Class 1_1 desc.", "units_1"],
            ["1_1_0001", "category","subject", "Cat 1_1_0001", "Cat 1_1_0001 desc.", ""],
            ["1_1_0002", "category","subject", "Cat 1_1_0002", "Cat 1_1_0002 desc.", ""],
            ["1_1_0003", "category","subject", "Cat 1_1_0003", "Cat 1_1_0003 desc.", ""],
            ["1_2", "classification","category", "Class 1_2", "Class 1_2 desc.", "units_2"],
            ["1_2_0001", "category","subject", "Cat 1_2_0001", "Cat 1_2_0001 desc.", ""],
            ["1_2_0002", "category","subject", "Cat 1_2_0002", "Cat 1_2_0002 desc.", ""],
            ["1_2_0003", "category","subject", "Cat 1_2_0003", "Cat 1_2_0003 desc.", ""],
        ])
       
        # WHEN we run the content_csv_to_json script
        os.system(f"./content_csv_to_json.py {self.test_fp}")

        # THEN we expect to get a properly formatted JSON back
        expected = {
            "meta": {
                "source": self.test_fn
            },
            "content": [
                {
                    "code": "1",
                    "name": "Topic 1",
                    "slug": "topic-1",
                    "desc": "Topic 1 desc.",
                    "display_taxonomy": "topic",
                    "classifications": [
                        {
                            "code": "1_1",
                            "name": "Class 1_1",
                            "slug": "class-1-1",
                            "desc": "Class 1_1 desc.",
                            "units": "units_1",
                            "display_taxonomy": "category",
                            "total": {
                                "code": "1_1_0001",
                                "name": "Cat 1_1_0001",
                                "slug": "cat-1-1-0001",
                                "desc": "Cat 1_1_0001 desc.",
                                "display_taxonomy": "subject",
                            },
                            "categories": [
                                {
                                    "code": "1_1_0002",
                                    "name": "Cat 1_1_0002",
                                    "slug": "cat-1-1-0002",
                                    "desc": "Cat 1_1_0002 desc.",
                                    "display_taxonomy": "subject",
                                },
                                {
                                    "code": "1_1_0003",
                                    "name": "Cat 1_1_0003",
                                    "slug": "cat-1-1-0003",
                                    "desc": "Cat 1_1_0003 desc.",
                                    "display_taxonomy": "subject"
                                },
                            ]
                        },
                        {
                            "code": "1_2",
                            "name": "Class 1_2",
                            "slug": "class-1-2",
                            "desc": "Class 1_2 desc.",
                            "units": "units_2",
                            "display_taxonomy": "category",
                            "total": {
                                "code": "1_2_0001",
                                "name": "Cat 1_2_0001",
                                "slug": "cat-1-2-0001",
                                "desc": "Cat 1_2_0001 desc.",
                                "display_taxonomy": "subject",
                            },
                            "categories": [
                                {
                                    "code": "1_2_0002",
                                    "name": "Cat 1_2_0002",
                                    "slug": "cat-1-2-0002",
                                    "desc": "Cat 1_2_0002 desc.",
                                    "display_taxonomy": "subject",
                                },
                                {
                                    "code": "1_2_0003",
                                    "name": "Cat 1_2_0003",
                                    "slug": "cat-1-2-0003",
                                    "desc": "Cat 1_2_0003 desc.",
                                    "display_taxonomy": "subject"
                                },
                            ]
                        },
                    ]
                }
            ]
        }
        returned = self.read_test_JSON()
        self.assertEqual(expected, returned)

    def test_content_csv_to_json_OK_subcategories(self):
        # GIVEN we have written a csv with one topic and one classification with one category, one total and two 
        # two subcategories
        self.write_test_CSV([
            ["code","taxonomy","display taxonomy","name","desc","units"],
            ["1", "topic","topic", "Topic 1", "Topic 1 desc.", ""],
            ["1_1", "classification","category", "Class 1_1", "Class 1_1 desc.", "units_1"],
            ["1_1_0001", "category","subject", "Cat 1_1_0001", "Cat 1_1_0001 desc.", ""],
            ["1_1_0002", "category","subject", "Cat 1_1_0002", "Cat 1_1_0002 desc.", ""],
            ["1_1_0002_1", "sub-category","sub-subject", "Sub-Cat 1_1_0002_1", "Sub-Cat 1_1_0002_1 desc.", ""],
            ["1_1_0002_2", "sub-category","sub-subject", "Sub-Cat 1_1_0002_2", "Sub-Cat 1_1_0002_2 desc.", ""]
        ])
       
        # WHEN we run the content_csv_to_json script
        os.system(f"./content_csv_to_json.py {self.test_fp}")

        # THEN we expect to get a properly formatted JSON back
        expected = {
            "meta": {
                "source": self.test_fn
            },
            "content": [
                {
                    "code": "1",
                    "name": "Topic 1",
                    "slug": "topic-1",
                    "desc": "Topic 1 desc.",
                    "display_taxonomy": "topic",
                    "classifications": [
                        {
                            "code": "1_1",
                            "name": "Class 1_1",
                            "slug": "class-1-1",
                            "desc": "Class 1_1 desc.",
                            "units": "units_1",
                            "display_taxonomy": "category",
                            "total": {
                                "code": "1_1_0001",
                                "name": "Cat 1_1_0001",
                                "slug": "cat-1-1-0001",
                                "desc": "Cat 1_1_0001 desc.",
                                "display_taxonomy": "subject",
                            },
                            "categories": [
                                {
                                    "code": "1_1_0002",
                                    "name": "Cat 1_1_0002",
                                    "slug": "cat-1-1-0002",
                                    "desc": "Cat 1_1_0002 desc.",
                                    "display_taxonomy": "subject",
                                    "sub-categories": [
                                        {
                                            "code": "1_1_0002_1",
                                            "name": "Sub-Cat 1_1_0002_1",
                                            "slug": "sub-cat-1-1-0002-1",
                                            "desc": "Sub-Cat 1_1_0002_1 desc.",
                                            "display_taxonomy": "sub-subject"
                                        },
                                        {
                                            "code": "1_1_0002_2",
                                            "name": "Sub-Cat 1_1_0002_2",
                                            "slug": "sub-cat-1-1-0002-2",
                                            "desc": "Sub-Cat 1_1_0002_2 desc.",
                                            "display_taxonomy": "sub-subject"
                                        },
                                        
                                    ]
                                },
                            ]
                        }
                    ]
                }
            ]
        }
        returned = self.read_test_JSON()
        self.assertEqual(expected, returned)

    def test_content_csv_to_json_blank_cat_desc_placeholder(self):
        # GIVEN we have written a csv with one topic and one classification with one category, with blank desc values
        self.write_test_CSV([
            ["code","taxonomy","display taxonomy","name","desc","units"],
            ["1", "topic","topic", "Topic 1", "", ""],
            ["1_1", "classification","category", "Class 1_1", "", "units_1"],
            ["1_1_0002", "category","subject", "Cat 1_1_0002", "", ""]
        ])
        
        # WHEN we run the content_csv_to_json script
        os.system(f"./content_csv_to_json.py {self.test_fp}")

        # THEN we expect to get a properly formatted JSON back, with lorem ipsum placeholder descriptions
        expected = {
            "meta": {
                "source": self.test_fn
            },
            "content": [
                {
                    "code": "1",
                    "name": "Topic 1",
                    "slug": "topic-1",
                    "desc": content_csv_to_json.DESC_PLACEHOLDER,
                    "display_taxonomy": "topic",
                    "classifications": [
                        {
                            "code": "1_1",
                            "name": "Class 1_1",
                            "slug": "class-1-1",
                            "desc": content_csv_to_json.DESC_PLACEHOLDER,
                            "units": "units_1",
                            "display_taxonomy": "category",
                            "categories": [
                                {
                                    "code": "1_1_0002",
                                    "name": "Cat 1_1_0002",
                                    "slug": "cat-1-1-0002",
                                    "desc": content_csv_to_json.DESC_PLACEHOLDER,
                                    "display_taxonomy": "subject"
                                },
                            ]
                        }
                    ]
                }
            ]
        }
        returned = self.read_test_JSON()
        self.assertEqual(expected, returned)


    def test_content_csv_to_json_ignores_content_with_no_code(self):
        # GIVEN we have written a csv with one topic and two classifications with one category, one set with blank codes
        self.write_test_CSV([
            ["code","taxonomy","display taxonomy","name","desc","units"],
            ["1", "topic","topic", "Topic 1", "Topic 1 desc.", ""],
            ["1_1", "classification","category", "Class 1_1", "Class 1_1 desc.", "units_1"],
            ["1_1_0002", "category","subject", "Cat 1_1_0002", "Cat 1_1_0002 desc.", ""],
            ["", "classification","category", "Class 1_2", "Class 1_2 desc.", "units_2"],
            ["", "category","subject", "Cat 1_2_0002", "Cat 1_1_0002 desc.", ""]
        ])
        
        # WHEN we run the content_csv_to_json script
        os.system(f"./content_csv_to_json.py {self.test_fp}")

        # THEN we expect to get a properly formatted JSON back, with the blank code entries ignored
        expected = {
            "meta": {
                "source": self.test_fn
            },
            "content": [
                {
                    "code": "1",
                    "name": "Topic 1",
                    "slug": "topic-1",
                    "desc": "Topic 1 desc.",
                    "display_taxonomy": "topic",
                    "classifications": [
                        {
                            "code": "1_1",
                            "name": "Class 1_1",
                            "slug": "class-1-1",
                            "desc": "Class 1_1 desc.",
                            "units": "units_1",
                            "display_taxonomy": "category",
                            "categories": [
                                {
                                    "code": "1_1_0002",
                                    "name": "Cat 1_1_0002",
                                    "slug": "cat-1-1-0002",
                                    "desc": "Cat 1_1_0002 desc.",
                                    "display_taxonomy": "subject"
                                },
                            ]
                        }
                    ]
                }
            ]
        }
        returned = self.read_test_JSON()
        self.assertEqual(expected, returned)
